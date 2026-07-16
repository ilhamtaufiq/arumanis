import type { MasterFasePekerjaan } from '../types/master-fase';

export interface EditableItem {
    id: string | number;
    parent_id?: string | number | null;
    urutan: string;
    uraian: string;
    satuan: string;
    volume: number;
    harga_satuan: number;
    rencana: { [minggu: number]: number };
    realisasi: { [minggu: number]: number };
}

export interface ScheduledGroup {
    groupId: string;
    groupName: string;
    fase: MasterFasePekerjaan | null;
    startWeek: number;
    endWeek: number;
    items: EditableItem[];
}

const itemKey = (id: string | number) => String(id);

/**
 * SMKK (Sistem Manajemen Keselamatan Konstruksi) harus selalu di minggu pertama.
 */
export function isSmkkRelatedText(text: string): boolean {
    const lower = text.toLowerCase()

    if (/\bsmkk\b/.test(lower)) return true
    if (lower.includes('manajemen keselamatan')) return true
    if (lower.includes('keselamatan konstruksi')) return true
    if (lower.includes('penyelenggaraan sistem manajemen')) return true
    if (/\binduksi k3\b/.test(lower)) return true
    if (lower.includes('safety induction')) return true
    if (lower.includes('safety talk')) return true
    if (lower.includes('tool box')) return true
    if (/\bapd\b/.test(lower)) return true
    if (lower.includes('alat pelindung')) return true
    if (/\bp3k\b/.test(lower)) return true
    if (lower.includes('rencana keselamatan')) return true
    if (/\brkk\b/.test(lower)) return true
    if (lower.includes('rompi keselamatan')) return true
    if (lower.includes('safety helmet')) return true
    if (lower.includes('safety shoes')) return true
    if (lower.includes('safety gloves')) return true
    if (lower.includes('safety vest')) return true

    return false
}

function isSmkkGroup(group: { groupName?: string; name?: string; items?: EditableItem[] }): boolean {
    const header = group.groupName ?? group.name ?? ''
    return isSmkkRelatedText(header)
}

/**
 * 1. Auto-detect project type based on item names
 * Sanitasi has items like "STP", "Biofilter", "Pipa PVC", "Bak Kontrol"
 * SPAM has items like "Pemboran", "Sumur", "Reservoir", "Pompa Submersible", "Sambungan Rumah"
 */
export function detectJenisProyek(items: EditableItem[]): string {
    let spamScore = 0;
    let sanitasiScore = 0;

    const allText = items.map(i => i.uraian.toLowerCase()).join(' ');

    if (allText.match(/pemboran|sumur|cassing|hidropore|sambungan rumah|water meter|hidran umum/)) spamScore += 2;
    if (allText.match(/tangki|reservoir|pompa submersible|transmisi|distribusi/)) spamScore += 1;
    if (allText.match(/pvc|pemasangan pipa|pengadaan pipa|gate valve|spam|pipa dan asesoris|pekerjaan persiapan/)) spamScore += 1;
    if (allText.match(/mck|septik|ipal|bak kontrol sanitasi/)) sanitasiScore += 1;

    if (allText.match(/stp|biofilter|grease trap|sump pit|bak kontrol/)) sanitasiScore += 2;
    if (allText.match(/air limbah|sanitasi/)) sanitasiScore += 1;

    // Default to 'sanitasi' if it's tied or unclear
    return spamScore > sanitasiScore ? 'air_minum' : 'sanitasi';
}

/**
 * 2. Classify a group/item into a Master Fase based on keywords.
 * Prefers longer keyword hits; skips inactive phases.
 */
export function classifyPhase(
    text: string,
    masterFases: MasterFasePekerjaan[]
): MasterFasePekerjaan | null {
    const lowerText = text.toLowerCase()
    let best: { fase: MasterFasePekerjaan; score: number } | null = null

    const ordered = masterFases
        .filter((f) => f.is_active !== false)
        .slice()
        .sort((a, b) => a.prioritas - b.prioritas)

    for (const fase of ordered) {
        if (!fase.keywords) continue

        let keywordsArray: string[] = []
        if (Array.isArray(fase.keywords)) {
            keywordsArray = fase.keywords
        } else if (typeof fase.keywords === 'string') {
            try {
                const parsed = JSON.parse(fase.keywords)
                keywordsArray = Array.isArray(parsed) ? parsed : [fase.keywords]
            } catch {
                keywordsArray = [fase.keywords]
            }
        }

        for (const keyword of keywordsArray) {
            if (!keyword || typeof keyword !== 'string') continue
            const needle = keyword.toLowerCase().trim()
            if (!needle) continue
            if (lowerText.includes(needle)) {
                const score = needle.length
                if (!best || score > best.score) {
                    best = { fase, score }
                }
            }
        }
    }

    return best?.fase ?? null
}

/**
 * 3. Calculate schedule for groups based on phases
 */
export function calculateSchedule(
    items: EditableItem[],
    masterFases: MasterFasePekerjaan[],
    totalWeeks: number
): ScheduledGroup[] {
    // 1. Group items by their parent (Header)
    const groupsMap = new Map<string, { id: string; name: string; items: EditableItem[] }>();
    const rootItems: EditableItem[] = []; // Items without parent
    
    // First, find all headers
    items.forEach(item => {
        // If it has children, it's a header
        const hasChildren = items.some(child => child.parent_id != null && itemKey(child.parent_id) === itemKey(item.id));
        if (hasChildren) {
            const groupId = itemKey(item.id);
            groupsMap.set(groupId, { id: groupId, name: item.uraian, items: [] });
        }
    });

    // Then assign items to their headers
    items.forEach(item => {
        const hasChildren = items.some(child => child.parent_id != null && itemKey(child.parent_id) === itemKey(item.id));
        if (!hasChildren) {
            const parentId = item.parent_id ? itemKey(item.parent_id) : null;
            if (parentId && groupsMap.has(parentId)) {
                groupsMap.get(parentId)!.items.push(item);
            } else {
                rootItems.push(item);
            }
        }
    });

    // If there are root items, group them in a generic "General" group
    if (rootItems.length > 0) {
        groupsMap.set('root', { id: 'root', name: 'Pekerjaan Umum', items: rootItems });
    }

    const scheduledGroups: ScheduledGroup[] = [];
    
    // Classify each group
    for (const [groupId, group] of Array.from(groupsMap.entries())) {
        // Combine header name and all item names for better context
        const contextText = [
            group.name,
            ...group.items.map((item) => item.uraian),
        ].join(' ');
        const fase = classifyPhase(contextText, masterFases);
        
        scheduledGroups.push({
            groupId,
            groupName: group.name,
            fase,
            startWeek: 1, // Will be updated later
            endWeek: totalWeeks, // Will be updated later
            items: group.items
        });
    }

    // SMKK di minggu pertama; grup lain mengikuti prioritas fase
    scheduledGroups.sort((a, b) => {
        const smkkA = isSmkkGroup(a) ? 0 : 1;
        const smkkB = isSmkkGroup(b) ? 0 : 1;
        if (smkkA !== smkkB) return smkkA - smkkB;

        const pA = a.fase ? a.fase.prioritas : 999;
        const pB = b.fase ? b.fase.prioritas : 999;
        return pA - pB;
    });

    const activeGroups = scheduledGroups.filter(g => g.items.length > 0);
    if (activeGroups.length === 0) return [];

    const smkkGroups = activeGroups.filter(isSmkkGroup);
    const nonSmkkGroups = activeGroups.filter(g => !isSmkkGroup(g));

    // Semua pekerjaan SMKK dipin ke minggu 1
    for (const group of smkkGroups) {
        group.startWeek = 1;
        group.endWeek = 1;
    }

    let currentWeek = 1;

    const totalWeight = nonSmkkGroups.reduce((sum, g) => {
        const weight = (g.items.length || 1) * (g.fase ? g.fase.durasi_faktor : 1.0);
        return sum + weight;
    }, 0);

    for (let i = 0; i < nonSmkkGroups.length; i++) {
        const group = nonSmkkGroups[i];
        const weight = (group.items.length || 1) * (group.fase ? group.fase.durasi_faktor : 1.0);

        const durationWeeks = totalWeight > 0
            ? Math.max(1, Math.round((weight / totalWeight) * totalWeeks))
            : 1;

        if (i > 0 && group.fase && group.fase.overlap_persen > 0) {
            const prevGroup = nonSmkkGroups[i - 1];
            const prevDuration = prevGroup.endWeek - prevGroup.startWeek + 1;
            const overlapWeeks = Math.round(prevDuration * (group.fase.overlap_persen / 100));
            currentWeek = Math.max(1, currentWeek - overlapWeeks);
        }

        const start = Math.max(1, currentWeek);
        let end = Math.min(totalWeeks, start + durationWeeks - 1);
        end = Math.max(start, end);

        group.startWeek = start;
        group.endWeek = end;

        currentWeek = end + 1;
    }

    const maxEnd = Math.max(...nonSmkkGroups.map(g => g.endWeek), 1);
    if (nonSmkkGroups.length > 0 && maxEnd > totalWeeks) {
        const scale = totalWeeks / maxEnd;
        nonSmkkGroups.forEach(g => {
            g.startWeek = Math.max(1, Math.floor(g.startWeek * scale));
            g.endWeek = Math.max(g.startWeek, Math.floor(g.endWeek * scale));
        });
        nonSmkkGroups[nonSmkkGroups.length - 1].endWeek = totalWeeks;
    }

    return scheduledGroups;
}

/**
 * 4. Distribute volume across the scheduled weeks
 */
export function distributeVolume(
    totalVolume: number,
    startWeek: number,
    endWeek: number
): Record<number, number> {
    const rencana: Record<number, number> = {};
    const duration = endWeek - startWeek + 1;
    
    if (duration <= 0) {
        rencana[startWeek] = totalVolume;
        return rencana;
    }

    // Distribute evenly for now (could be bell curve in advanced version)
    const perWeek = Number((totalVolume / duration).toFixed(4));
    let accumulated = 0;

    for (let w = startWeek; w <= endWeek; w++) {
        if (w === endWeek) {
            // Put the remainder in the last week to avoid rounding errors
            rencana[w] = Number((totalVolume - accumulated).toFixed(4));
        } else {
            rencana[w] = perWeek;
            accumulated += perWeek;
        }
    }

    return rencana;
}

/**
 * 5. Generate full rencana for all items
 */
export function applyAutoFill(
    items: EditableItem[],
    masterFases: MasterFasePekerjaan[],
    totalWeeks: number
): EditableItem[] {
    const scheduledGroups = calculateSchedule(items, masterFases, totalWeeks);
    const newItems = JSON.parse(JSON.stringify(items)) as EditableItem[];

    const groupScheduleMap = new Map<string, { start: number; end: number }>();
    scheduledGroups.forEach(g => {
        groupScheduleMap.set(g.groupId, { start: g.startWeek, end: g.endWeek });
    });

    const smkkGroupIds = new Set(
        scheduledGroups.filter(isSmkkGroup).map(g => g.groupId),
    );

    newItems.forEach(item => {
        if (item.volume > 0) {
            let start = 1;
            let end = totalWeeks;

            const parentId = item.parent_id ? itemKey(item.parent_id) : null;
            const inSmkkGroup = parentId != null && smkkGroupIds.has(parentId);
            const isSmkkItem = inSmkkGroup || isSmkkRelatedText(item.uraian);

            if (isSmkkItem) {
                item.rencana = distributeVolume(item.volume, 1, 1);
                return;
            }

            if (parentId && groupScheduleMap.has(parentId)) {
                const sched = groupScheduleMap.get(parentId)!;
                start = sched.start;
                end = sched.end;
            } else if (groupScheduleMap.has('root')) {
                const sched = groupScheduleMap.get('root')!;
                start = sched.start;
                end = sched.end;
            }

            item.rencana = distributeVolume(item.volume, start, end);
        } else {
            item.rencana = {};
        }
    });

    return newItems;
}
