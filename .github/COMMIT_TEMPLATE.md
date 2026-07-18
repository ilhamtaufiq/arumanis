# Conventional commit (judul di baris 1, kosong, body opsional)
#
# Format:
#   <type>(<scope>): <ringkas apa yang diubah>
#
# type:  feat | fix | docs | style | refactor | perf | test | build | ci | chore | revert
# scope: pekerjaan | kontrak | foto | bff | docker | docs | auth | sipd | spse | …
#
# Contoh:
#   feat(pekerjaan): export ZIP dengan opsi kolom
#   fix(docker): naikkan heap Node saat build SPA
#   docs(readme): selaraskan badge ke v0.6.0
#
# Aturan singkat:
# - Judul max ~72 karakter, imperative ("tambah" bukan "menambahkan")
# - Satu concern per commit
# - Jangan Co-authored-by bot/AI
# - Breaking change: footer "BREAKING CHANGE: …"
