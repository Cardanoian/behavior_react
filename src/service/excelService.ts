import * as XLSX from 'xlsx';
import { ExcelData, EvaluationItem, SchoolCategory } from '../model';

export const readExcelFile = (
  file: File,
  schoolCategory: SchoolCategory
): Promise<[ExcelData, XLSX.WorkBook]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        if (!e.target?.result) {
          throw new Error('Failed to read file');
        }

        const data = new Uint8Array(e.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, {
          type: 'array',
          cellDates: true,
          cellStyles: true,
        });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const evaluations: EvaluationItem[] = [];

        let currentRow = 1;
        let lastNum: string = '1';

        while (true) {
          // 행의 모든 열이 비어있는지 확인 (1~2열)
          let isEmptyRow = true;
          for (let col = 0; col < 3; col++) {
            const cellAddress = XLSX.utils.encode_cell({
              r: currentRow,
              c: col,
            });
            if (sheet[cellAddress]?.v) {
              isEmptyRow = false;
              break;
            }
          }

          // 빈 행을 만나면 파일 읽기 종료
          if (isEmptyRow) {
            break;
          }

          // 필요한 데이터 읽기
          const numberCell: string = sheet[
            XLSX.utils.encode_cell({ r: currentRow, c: 0 })
          ]?.v
            ?.toString()
            .trim();
          const characteristicsCell: string =
            sheet[XLSX.utils.encode_cell({ r: currentRow, c: 1 })]?.v
              ?.toString()
              .trim() ?? '';

          // 영역이 비어있으면 다음 행으로
          if (!characteristicsCell || characteristicsCell == '학생특성') {
            currentRow++;
            continue;
          }

          const item: EvaluationItem = {
            number: numberCell || lastNum,
            characteristics: characteristicsCell,
            result:
              sheet[
                XLSX.utils.encode_cell({
                  r: currentRow,
                  c: schoolCategory === 'kinder' ? 4 : 3,
                })
              ]?.v?.toString() || '',
          };
          if (schoolCategory === 'kinder') {
            const activityCell: string =
              sheet[XLSX.utils.encode_cell({ r: currentRow, c: 2 })]?.v
                ?.toString()
                .trim() ?? '';
            item.activity = activityCell;
          }
          lastNum = item.number;

          evaluations.push(item);
          currentRow++;
        }

        resolve([
          {
            evaluations,
          },
          workbook,
        ]);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
};

export const generateExcelFile = (
  workbook: XLSX.WorkBook | null,
  evaluations: EvaluationItem[],
  schoolCategory: SchoolCategory
): void => {
  // 새로운 워크북과 시트 생성
  const newWorkbook = XLSX.utils.book_new();
  const newSheet: XLSX.WorkSheet = {};
  let sheetName: string;

  if (workbook) {
    sheetName = workbook.SheetNames[0];
    const originalSheet = workbook.Sheets[sheetName];

    // 헤더 복사 (1행의 컬럼명만)
    const columns = ['A', 'B']; // 실제 사용할 열들
    if (schoolCategory === 'kinder') columns.push('C');

    columns.forEach((col) => {
      const cellAddress = `${col}1`;
      if (originalSheet[cellAddress]) {
        newSheet[cellAddress] = { ...originalSheet[cellAddress] };
      }
    });

    // 열 너비 설정 (원본에서 복사)
    if (originalSheet['!cols']) {
      newSheet['!cols'] = originalSheet['!cols'];
    }
  } else {
    sheetName =
      schoolCategory === 'kinder'
        ? '유아 행동발달상황'
        : '행동특성 및 종합의견';
    newSheet['A1'] = { t: 's', v: '번호' };
    newSheet['B1'] = {
      t: 's',
      v: schoolCategory === 'kinder' ? '유아특성' : '학생특성',
    };

    const cols = [{ wch: 10 }, { wch: 50 }]; // 번호, 학생/유아특성
    if (schoolCategory === 'kinder') {
      newSheet['C1'] = { t: 's', v: '놀이활동' };
      newSheet['D1'] = { t: 's', v: '생성결과' };
      cols.push({ wch: 50 }, { wch: 80 }); // 놀이활동, 생성결과
    } else {
      newSheet['C1'] = { t: 's', v: '생성결과' };
      cols.push({ wch: 80 }); // 생성결과
    }
    newSheet['!cols'] = cols;
  }

  // 데이터 쓰기 (2행부터)
  evaluations.forEach((item, index) => {
    const row = index + 1; // 2행부터 시작

    // 각 열에 데이터 쓰기
    newSheet[XLSX.utils.encode_cell({ r: row, c: 0 })] = {
      t: 's',
      v: item.number,
    };
    newSheet[XLSX.utils.encode_cell({ r: row, c: 1 })] = {
      t: 's',
      v: item.characteristics,
    };
    if (schoolCategory === 'kinder') {
      newSheet[XLSX.utils.encode_cell({ r: row, c: 2 })] = {
        t: 's',
        v: item.activity,
      };
    }
    newSheet[
      XLSX.utils.encode_cell({
        r: row,
        c: schoolCategory === 'kinder' ? 3 : 2,
      })
    ] = {
      t: 's',
      v: item.result,
    };
  });

  // 범위 설정
  const range = {
    s: { c: 0, r: 0 },
    e: { c: schoolCategory === 'kinder' ? 3 : 2, r: evaluations.length },
  };
  newSheet['!ref'] = XLSX.utils.encode_range(range);

  // 새 시트를 워크북에 추가
  XLSX.utils.book_append_sheet(newWorkbook, newSheet, sheetName);

  // 파일 다운로드
  const wbout = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'binary' });

  function s2ab(s: string) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  }

  const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download =
    schoolCategory === 'kinder' ? '유아행동발달사항.xlsx' : '행발생성결과.xlsx';
  a.click();
  window.URL.revokeObjectURL(url);
};

export const generateTemplateExcelFile = (
  schoolCategory: SchoolCategory
): void => {
  const sheetName = '';

  // 새로운 워크북과 시트 생성
  const newWorkbook = XLSX.utils.book_new();
  const newSheet: XLSX.WorkSheet = {};

  // 헤더 만들기 (1행의 컬럼명만)
  newSheet['A1'] = { t: 's', v: '번호' };
  newSheet['B1'] = {
    t: 's',
    v: schoolCategory === 'kinder' ? '유아특성' : '학생특성',
  };

  const cols = [{ wch: 10 }, { wch: 50 }]; // 번호, 학생/유아특성
  if (schoolCategory === 'kinder') {
    newSheet['C1'] = { t: 's', v: '놀이활동' };
    cols.push({ wch: 50 }); // 놀이활동
  }
  newSheet['!cols'] = cols;

  // 데이터 쓰기 (2행부터)
  for (let i = 1; i <= 30; i++) {
    // 각 열에 데이터 쓰기
    newSheet[XLSX.utils.encode_cell({ r: i, c: 0 })] = {
      t: 's',
      v: i,
    };
    newSheet[XLSX.utils.encode_cell({ r: i, c: 1 })] = {
      t: 's',
      v: '',
    };
    if (schoolCategory === 'kinder') {
      newSheet[XLSX.utils.encode_cell({ r: i, c: 2 })] = {
        t: 's',
        v: '',
      };
    }
  }

  // 범위 설정
  const range = {
    s: { c: 0, r: 0 },
    e: { c: schoolCategory === 'kinder' ? 3 : 2, r: 30 },
  };
  newSheet['!ref'] = XLSX.utils.encode_range(range);

  // 새 시트를 워크북에 추가
  XLSX.utils.book_append_sheet(newWorkbook, newSheet, sheetName);

  // 파일 다운로드
  const wbout = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'binary' });

  function s2ab(s: string) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  }

  const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '행발입력자료.xlsx';
  a.click();
  window.URL.revokeObjectURL(url);
};
