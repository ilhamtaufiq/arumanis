#!/usr/bin/env bash
# Build APK/AAB Android Arumanis di Ubuntu server (22.04 / 24.04).
#
# Yang dilakukan:
#   1. Pasang dependensi sistem yang belum ada: JDK 21, unzip, curl, Android SDK command-line tools, Bun.
#   2. Pasang komponen SDK yang dibutuhkan (platform, build-tools, platform-tools) dan terima lisensinya.
#   3. Pasang dependensi JavaScript (bun install --frozen-lockfile) dan build frontend (vite).
#   4. npx cap sync android, lalu gradlew assembleRelease (APK) atau bundleRelease (AAB).
#   5. Jika keystore diberikan, tanda tangani dan simpan hasilnya ke ./release-artifacts.
#
# Pemakaian:
#   scripts/build-android.sh                       # APK release, belum ditandatangani
#   scripts/build-android.sh --debug               # APK debug (ditandatangani keystore debug otomatis)
#   scripts/build-android.sh --aab                 # AAB release untuk Play Console
#   scripts/build-android.sh --server-url https://arumanis.cianjur.space/m
#   scripts/build-android.sh --skip-setup          # lewati pemasangan SDK (sudah terpasang)
#
# Penandatanganan release (opsional, lewat environment, jangan tulis di file ini):
#   ANDROID_KEYSTORE=/path/ke/arumanis-release.jks
#   ANDROID_KEY_ALIAS=arumanis
#   ANDROID_KEYSTORE_PASS=...      (kata sandi keystore)
#   ANDROID_KEY_PASS=...           (kata sandi key; default sama dengan keystore)
#
# Variabel lain:
#   ANDROID_HOME        lokasi Android SDK (default: $HOME/Android/Sdk)
#   CAPACITOR_SERVER_URL  URL yang dimuat aplikasi (default: https://arumanis.cianjur.space/m)
#   ANDROID_PLATFORM    platform SDK (default: android-36)
#   ANDROID_BUILD_TOOLS versi build-tools (default: 36.0.0)

set -euo pipefail

# ---------- konfigurasi ----------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ANDROID_HOME="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Android/Sdk}}"
ANDROID_PLATFORM="${ANDROID_PLATFORM:-android-36}"
ANDROID_BUILD_TOOLS="${ANDROID_BUILD_TOOLS:-36.0.0}"
CMDLINE_TOOLS_ZIP="commandlinetools-linux-11076708_latest.zip"
CMDLINE_TOOLS_URL="https://dl.google.com/android/repository/${CMDLINE_TOOLS_ZIP}"
OUT_DIR="$ROOT_DIR/release-artifacts"

MODE="release"        # release | debug
FORMAT="apk"          # apk | aab
SKIP_SETUP=0
SERVER_URL="${CAPACITOR_SERVER_URL:-https://arumanis.cianjur.space/m}"

# ---------- helper ----------
log()  { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33mPERINGATAN: %s\033[0m\n' "$*" >&2; }
die()  { printf '\033[1;31mGAGAL: %s\033[0m\n' "$*" >&2; exit 1; }

usage() {
    sed -n '2,27p' "$0" | sed 's/^# \{0,1\}//'
    exit 0
}

# Jalankan perintah dengan sudo bila bukan root.
as_root() {
    if [ "$(id -u)" -eq 0 ]; then "$@"; else sudo "$@"; fi
}

# ---------- argumen ----------
while [ $# -gt 0 ]; do
    case "$1" in
        --debug)        MODE="debug"; shift ;;
        --aab)          FORMAT="aab"; shift ;;
        --server-url)   SERVER_URL="${2:?--server-url butuh nilai}"; shift 2 ;;
        --skip-setup)   SKIP_SETUP=1; shift ;;
        -h|--help)      usage ;;
        *)              die "argumen tidak dikenal: $1 (lihat --help)" ;;
    esac
done

if [ "$MODE" = "debug" ] && [ "$FORMAT" = "aab" ]; then
    die "--debug tidak bisa dipakai dengan --aab"
fi

export ANDROID_HOME ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/build-tools/$ANDROID_BUILD_TOOLS:$HOME/.bun/bin:$PATH"

# ---------- 1. dependensi sistem ----------
install_system_packages() {
    log "Memasang paket sistem (JDK 21, unzip, curl)"
    as_root apt-get update -y
    as_root env DEBIAN_FRONTEND=noninteractive apt-get install -y \
        openjdk-21-jdk-headless unzip zip curl ca-certificates git
}

ensure_java() {
    if command -v java >/dev/null 2>&1; then
        local major
        major="$(java -version 2>&1 | sed -n 's/.*version "\([0-9]*\).*/\1/p' | head -1)"
        if [ -n "$major" ] && [ "$major" -ge 17 ]; then
            return 0
        fi
    fi
    install_system_packages
}

install_android_sdk() {
    local sdkmanager="$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager"
    if [ ! -x "$sdkmanager" ]; then
        log "Mengunduh Android command-line tools ke $ANDROID_HOME"
        mkdir -p "$ANDROID_HOME/cmdline-tools"
        local tmp
        tmp="$(mktemp -d)"
        curl -fL --retry 4 -o "$tmp/$CMDLINE_TOOLS_ZIP" "$CMDLINE_TOOLS_URL"
        unzip -q "$tmp/$CMDLINE_TOOLS_ZIP" -d "$tmp"
        rm -rf "$ANDROID_HOME/cmdline-tools/latest"
        mv "$tmp/cmdline-tools" "$ANDROID_HOME/cmdline-tools/latest"
        rm -rf "$tmp"
    fi

    log "Menerima lisensi SDK dan memasang komponen $ANDROID_PLATFORM, build-tools $ANDROID_BUILD_TOOLS"
    yes | "$sdkmanager" --sdk_root="$ANDROID_HOME" --licenses >/dev/null || true
    "$sdkmanager" --sdk_root="$ANDROID_HOME" \
        "platform-tools" \
        "platforms;$ANDROID_PLATFORM" \
        "build-tools;$ANDROID_BUILD_TOOLS"
}

ensure_bun() {
    if command -v bun >/dev/null 2>&1; then
        return 0
    fi
    log "Memasang Bun"
    curl -fsSL https://bun.sh/install | bash
    export PATH="$HOME/.bun/bin:$PATH"
    command -v bun >/dev/null 2>&1 || die "Bun gagal dipasang"
}

if [ "$SKIP_SETUP" -eq 0 ]; then
    ensure_java
    command -v unzip >/dev/null 2>&1 || install_system_packages
    install_android_sdk
    ensure_bun
else
    log "Lewati pemasangan SDK (--skip-setup)"
    command -v java >/dev/null 2>&1 || die "java tidak ditemukan"
    [ -d "$ANDROID_HOME/platforms/$ANDROID_PLATFORM" ] || die "$ANDROID_PLATFORM belum ada di $ANDROID_HOME"
    ensure_bun
fi

command -v java >/dev/null 2>&1 || die "java tidak ditemukan"
command -v bun >/dev/null 2>&1 || die "bun tidak ditemukan"

# ---------- 2. build web dan sinkronisasi Capacitor ----------
cd "$ROOT_DIR"

log "Memasang dependensi JavaScript (bun install --frozen-lockfile)"
bun install --frozen-lockfile

log "Build frontend (vite) dengan CAPACITOR_SERVER_URL=$SERVER_URL"
CAPACITOR_SERVER_URL="$SERVER_URL" bun run build:spa

log "npx cap sync android"
CAPACITOR_SERVER_URL="$SERVER_URL" ./node_modules/.bin/cap sync android

# ---------- 3. Gradle ----------
cd "$ROOT_DIR/android"
chmod +x ./gradlew

if [ "$MODE" = "debug" ]; then
    GRADLE_TASK="assembleDebug"
elif [ "$FORMAT" = "aab" ]; then
    GRADLE_TASK="bundleRelease"
else
    GRADLE_TASK="assembleRelease"
fi

log "gradlew $GRADLE_TASK"
./gradlew --no-daemon "$GRADLE_TASK"

# ---------- 4. penandatanganan dan salin hasil ----------
mkdir -p "$OUT_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"

if [ "$FORMAT" = "aab" ]; then
    SRC="$ROOT_DIR/android/app/build/outputs/bundle/release/app-release.aab"
    [ -f "$SRC" ] || die "AAB tidak ditemukan di $SRC"
    DEST="$OUT_DIR/arumanis-$STAMP.aab"
    if [ -n "${ANDROID_KEYSTORE:-}" ]; then
        log "Menandatangani AAB dengan jarsigner"
        : "${ANDROID_KEY_ALIAS:?ANDROID_KEY_ALIAS belum diisi}"
        : "${ANDROID_KEYSTORE_PASS:?ANDROID_KEYSTORE_PASS belum diisi}"
        export ANDROID_KEY_PASS="${ANDROID_KEY_PASS:-$ANDROID_KEYSTORE_PASS}"
        jarsigner -keystore "$ANDROID_KEYSTORE" \
            -storepass:env ANDROID_KEYSTORE_PASS \
            -keypass:env ANDROID_KEY_PASS \
            -signedjar "$DEST" "$SRC" "$ANDROID_KEY_ALIAS" >/dev/null 2>&1 \
            || die "jarsigner gagal (periksa alias dan kata sandi)"
    else
        warn "ANDROID_KEYSTORE tidak diisi, AAB tidak ditandatangani."
        cp "$SRC" "$DEST"
    fi
else
    if [ "$MODE" = "debug" ]; then
        SRC="$ROOT_DIR/android/app/build/outputs/apk/debug/app-debug.apk"
        DEST="$OUT_DIR/arumanis-debug-$STAMP.apk"
        [ -f "$SRC" ] || die "APK debug tidak ditemukan di $SRC"
        cp "$SRC" "$DEST"
    else
        SRC="$ROOT_DIR/android/app/build/outputs/apk/release/app-release-unsigned.apk"
        [ -f "$SRC" ] || SRC="$ROOT_DIR/android/app/build/outputs/apk/release/app-release.apk"
        [ -f "$SRC" ] || die "APK release tidak ditemukan di android/app/build/outputs/apk/release"
        DEST="$OUT_DIR/arumanis-$STAMP.apk"
        if [ -n "${ANDROID_KEYSTORE:-}" ]; then
            log "Menandatangani APK dengan apksigner"
            : "${ANDROID_KEY_ALIAS:?ANDROID_KEY_ALIAS belum diisi}"
            : "${ANDROID_KEYSTORE_PASS:?ANDROID_KEYSTORE_PASS belum diisi}"
            export ANDROID_KEY_PASS="${ANDROID_KEY_PASS:-$ANDROID_KEYSTORE_PASS}"
            ALIGNED="$(mktemp --suffix=.apk)"
            zipalign -f -p 4 "$SRC" "$ALIGNED"
            apksigner sign \
                --ks "$ANDROID_KEYSTORE" \
                --ks-key-alias "$ANDROID_KEY_ALIAS" \
                --ks-pass env:ANDROID_KEYSTORE_PASS \
                --key-pass env:ANDROID_KEY_PASS \
                --out "$DEST" "$ALIGNED"
            rm -f "$ALIGNED"
            apksigner verify --print-certs "$DEST" | head -2
        else
            warn "ANDROID_KEYSTORE tidak diisi, APK belum ditandatangani dan tidak bisa dipasang di perangkat."
            cp "$SRC" "$DEST"
        fi
    fi
fi

log "Selesai"
echo "Hasil: $DEST"
ls -lh "$DEST"
