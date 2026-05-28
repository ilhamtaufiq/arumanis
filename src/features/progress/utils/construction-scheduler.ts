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

    if (allText.match(/stp|biofilter|grease trap|sump pit|bak kontrol/)) sanitasiScore += 2;
    if (allText.match(/air limbah|sanitasi/)) sanitasiScore += 1;

    // Default to 'sanitasi' if it's tied or unclear
    return spamScore > sanitasiScore ? 'air_minum' : 'sanitasi';
}

/**
 * 2. Classify a group/item into a Master Fase based on keywords
 */
export function classifyPhase(
    text: string,
    masterFases: MasterFasePekerjaan[]
): MasterFasePekerjaan | null {
    const lowerText = text.toLowerCase();
    
    for (const fase of masterFases) {
        if (!fase.keywords) continue;
        
        let keywordsArray: string[] = [];
        if (Array.isArray(fase.keywords)) {
            keywordsArray = fase.keywords;
        } else if (typeof fase.keywords === 'string') {
            try {
                const parsed = JSON.parse(fase.keywords);
                keywordsArray = Array.isArray(parsed) ? parsed : [fase.keywords];
            } catch (e) {
                keywordsArray = [fase.keywords];
            }
        }
        
        for (const keyword of keywordsArray) {
            if (keyword && typeof keyword === 'string' && lowerText.includes(keyword.toLowerCase())) {
                return fase;
            }
        }
    }
    
    return null;
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
        const contextText = group.name + " " + group.items.map(i => i.uraian).join(" ");
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

    // Sort groups by their fase priority (if null, put them at the end)
    scheduledGroups.sort((a, b) => {
        const pA = a.fase ? a.fase.prioritas : 999;
        const pB = b.fase ? b.fase.prioritas : 999;
        return pA - pB;
    });

    // We distribute the total weeks among the groups based on their durasi_faktor
    // However, some groups overlap.
    // For simplicity:
    // Let's divide totalWeeks sequentially.
    
    // Filter out groups with no items
    const activeGroups = scheduledGroups.filter(g => g.items.length > 0);
    if (activeGroups.length === 0) return [];

    let currentWeek = 1;
    
    // Simple proportional allocation based on item count * durasi_faktor as a proxy for "weight"
    const totalWeight = activeGroups.reduce((sum, g) => {
        const weight = (g.items.length || 1) * (g.fase ? g.fase.durasi_faktor : 1.0);
        return sum + weight;
    }, 0);

    for (let i = 0; i < activeGroups.length; i++) {
        const group = activeGroups[i];
        const weight = (group.items.length || 1) * (group.fase ? group.fase.durasi_faktor : 1.0);
        
        // Base duration (minimum 1 week)
        let durationWeeks = Math.max(1, Math.round((weight / totalWeight) * totalWeeks));
        
        // Handle overlap with previous group
        if (i > 0 && group.fase && group.fase.overlap_persen > 0) {
            const prevGroup = activeGroups[i - 1];
            const prevDuration = prevGroup.endWeek - prevGroup.startWeek + 1;
            const overlapWeeks = Math.round(prevDuration * (group.fase.overlap_persen / 100));
            currentWeek = Math.max(1, currentWeek - overlapWeeks);
        }

        let start = Math.max(1, currentWeek);
        let end = Math.min(totalWeeks, start + durationWeeks - 1);
        
        // Ensure end isn't before start
        end = Math.max(start, end);

        group.startWeek = start;
        group.endWeek = end;

        currentWeek = end + 1;
    }
    
    // Final pass: ensure the last group ends exactly at totalWeeks if possible,
    // and no group exceeds totalWeeks.
    // Scale if we overshoot.
    const maxEnd = Math.max(...activeGroups.map(g => g.endWeek));
    if (maxEnd > totalWeeks) {
        // Compress everything
        const scale = totalWeeks / maxEnd;
        activeGroups.forEach(g => {
            g.startWeek = Math.max(1, Math.floor(g.startWeek * scale));
            g.endWeek = Math.max(g.startWeek, Math.floor(g.endWeek * scale));
        });
        // Force last one to end at totalWeeks
        activeGroups[activeGroups.length - 1].endWeek = totalWeeks;
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

    newItems.forEach(item => {
        // Only distribute volume if it's not a header (has volume)
        if (item.volume > 0) {
            let start = 1;
            let end = totalWeeks;

            // Find its group schedule
            const parentId = item.parent_id ? itemKey(item.parent_id) : null;
            if (parentId && groupScheduleMap.has(parentId)) {
                const sched = groupScheduleMap.get(parentId)!;
                start = sched.start;
                end = sched.end;
            } else if (groupScheduleMap.has('root')) {
                const sched = groupScheduleMap.get('root')!;
                start = sched.start;
                end = sched.end;
            }

            // Distribute volume
            item.rencana = distributeVolume(item.volume, start, end);
        } else {
            item.rencana = {}; // Clear headers
        }
    });

    return newItems;
}
