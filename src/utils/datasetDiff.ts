import { MonthlyDataset } from '../types';

export interface DatasetDiffResult {
  hasChanges: boolean;
  changes: string[];
  summaryDiff: string;
  firstChangedDo?: {
    noDo: string;
    oldStatus: string;
    newStatus: string;
    sheetName: string;
  };
}

/**
 * Compare two MonthlyDataset instances to detect any modifications in DO totals,
 * pending items, LKPB items, or daily counts.
 */
export function diffDatasets(
  oldData: MonthlyDataset | null,
  newData: MonthlyDataset
): DatasetDiffResult {
  if (!oldData) {
    return {
      hasChanges: false,
      changes: [],
      summaryDiff: 'Dataset awal berhasil dimuat.',
    };
  }

  const changes: string[] = [];
  let firstChangedDo: DatasetDiffResult['firstChangedDo'] = undefined;

  // 1. Check Total DO (totalJalur)
  const oldTotalDo = oldData.summary?.totalJalur ?? oldData.summary?.totalDo ?? 0;
  const newTotalDo = newData.summary?.totalJalur ?? newData.summary?.totalDo ?? 0;
  if (oldTotalDo !== newTotalDo) {
    const diff = newTotalDo - oldTotalDo;
    changes.push(
      `Total DO: ${oldTotalDo.toLocaleString()} ➔ ${newTotalDo.toLocaleString()} (${diff > 0 ? '+' : ''}${diff})`
    );
  }

  // 2. Check Total Pending
  const oldPending = oldData.summary?.totalPending || 0;
  const newPending = newData.summary?.totalPending || 0;
  if (oldPending !== newPending) {
    const diff = newPending - oldPending;
    changes.push(
      `Total Pending: ${oldPending} ➔ ${newPending} (${diff > 0 ? '+' : ''}${diff})`
    );
  }

  // 3. Check Total LKPB
  const oldLkpb = oldData.summary?.totalLkpb || 0;
  const newLkpb = newData.summary?.totalLkpb || 0;
  if (oldLkpb !== newLkpb) {
    const diff = newLkpb - oldLkpb;
    changes.push(
      `Total LKPB: ${oldLkpb} ➔ ${newLkpb} (${diff > 0 ? '+' : ''}${diff})`
    );
  }

  // 4. Check Detail Pending list for individual DO status or items
  const oldPendingMap = new Map<string, string>();
  (oldData.detailPending || []).forEach((item) => {
    const norm = (item.noDo || '').toUpperCase().trim();
    if (norm) oldPendingMap.set(norm, item.status || 'Pending');
  });

  const newPendingMap = new Map<string, string>();
  (newData.detailPending || []).forEach((item) => {
    const norm = (item.noDo || '').toUpperCase().trim();
    if (norm) newPendingMap.set(norm, item.status || 'Pending');
  });

  // Items added to pending
  newPendingMap.forEach((status, noDo) => {
    if (!oldPendingMap.has(noDo)) {
      changes.push(`DO ${noDo} masuk daftar Pending (${status})`);
      if (!firstChangedDo) {
        firstChangedDo = {
          noDo,
          oldStatus: 'Belum Ada',
          newStatus: status,
          sheetName: 'Detail Pending',
        };
      }
    } else {
      const prevStatus = oldPendingMap.get(noDo)!;
      if (prevStatus.toUpperCase() !== status.toUpperCase()) {
        changes.push(`DO ${noDo}: status berubah (${prevStatus} ➔ ${status})`);
        if (!firstChangedDo) {
          firstChangedDo = {
            noDo,
            oldStatus: prevStatus,
            newStatus: status,
            sheetName: 'Detail Pending',
          };
        }
      }
    }
  });

  // Items removed from pending (resolved)
  oldPendingMap.forEach((prevStatus, noDo) => {
    if (!newPendingMap.has(noDo)) {
      changes.push(`DO ${noDo} selesai/dikeluarkan dari Pending (sebelumnya: ${prevStatus})`);
      if (!firstChangedDo) {
        firstChangedDo = {
          noDo,
          oldStatus: prevStatus,
          newStatus: 'Clear/Finish',
          sheetName: 'Detail Pending',
        };
      }
    }
  });

  // 5. Check Detail LKPB list
  const oldLkpbSet = new Set((oldData.detailLkpb || []).map((i) => (i.noDo || '').toUpperCase().trim()));
  const newLkpbSet = new Set((newData.detailLkpb || []).map((i) => (i.noDo || '').toUpperCase().trim()));

  newLkpbSet.forEach((noDo) => {
    if (noDo && !oldLkpbSet.has(noDo)) {
      changes.push(`DO ${noDo} dicatat ke Detail LKPB`);
    }
  });

  // 6. Check Daily Records (for example, changes in daily input)
  const oldRecMap = new Map<string, number>();
  (oldData.records || []).forEach((r) => {
    oldRecMap.set(r.tanggal, r.totalJalur);
  });
  (newData.records || []).forEach((r) => {
    const oldJalur = oldRecMap.get(r.tanggal);
    if (oldJalur !== undefined && oldJalur !== r.totalJalur) {
      changes.push(`Data ${r.tanggal}: Jalur berubah dari ${oldJalur} ➔ ${r.totalJalur}`);
    }
  });

  const hasChanges = changes.length > 0;
  const summaryDiff = hasChanges
    ? `${changes.length} perubahan terdeteksi dari Google Spreadsheet`
    : 'Data spreadsheet telah sinkron (tidak ada perubahan baru)';

  return {
    hasChanges,
    changes,
    summaryDiff,
    firstChangedDo,
  };
}
