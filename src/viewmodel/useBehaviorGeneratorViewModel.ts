import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { EvaluationItem, SchoolCategory } from '../model';
import { generateExcelFile, readExcelFile } from '../service/excelService';
import { callGeminiApi } from '../service/geminiService';

export const useBehaviorGeneratorViewModel = () => {
  const [schoolCategory, setSchoolCategory] = useState<SchoolCategory>('ele');
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [fileName, setFileName] = useState<string>('');
  const [isUserGuideOpen, setIsUserGuideOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 직접 입력용 상태
  const [inputNumber, setInputNumber] = useState('');
  const [inputCharacteristics, setInputCharacteristics] = useState('');
  const [inputActivity, setInputActivity] = useState('');

  const handleAddEvaluation = () => {
    if (!inputNumber || !inputCharacteristics) {
      alert('모든 항목을 입력해주세요.');
      return;
    }
    const newItem: EvaluationItem = {
      number: inputNumber,
      characteristics: inputCharacteristics,
      result: '',
    };
    setEvaluations([...evaluations, newItem]);
    setInputNumber('');
    setInputCharacteristics('');
    setInputActivity('');
  };

  const handleDeleteEvaluation = (index: number) => {
    setEvaluations(evaluations.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setEvaluations([]);
    setWorkbook(null);
    setInputNumber('');
    setInputCharacteristics('');
    setInputActivity('');
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      try {
        const [data, wb] = await readExcelFile(file, schoolCategory);
        setEvaluations(data.evaluations);
        setWorkbook(wb);
      } catch (error) {
        console.error('엑셀 파일 처리 중 오류 발생:', error);
        alert('파일 처리 중 오류가 발생했습니다.');
        setFileName('');
      }
    } else {
      setFileName('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // if (evaluations.length === 0) {
    //   alert('자료가 없습니다.');
    //   return;
    // }

    setIsLoading(true);
    const updatedEvaluations = [...evaluations];
    const totalItems = evaluations.length;

    try {
      for (let i = 0; i < evaluations.length; i++) {
        const item = evaluations[i];
        const result = await callGeminiApi(item, schoolCategory);
        updatedEvaluations[i] = { ...item, result };
        setProgress(Math.round(((i + 1) / totalItems) * 100));
        setEvaluations([...updatedEvaluations]);
      }

      generateExcelFile(workbook, updatedEvaluations, schoolCategory);
    } catch (error) {
      console.error('행발 생성 중 오류 발생:', error);
      alert('행발 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  return {
    evaluations,
    isLoading,
    progress,
    fileName,
    isUserGuideOpen,
    setIsUserGuideOpen,
    fileInputRef,
    inputNumber,
    setInputNumber,
    inputCharacteristics,
    setInputCharacteristics,
    inputActivity,
    setInputActivity,
    schoolCategory,
    setSchoolCategory,
    handleAddEvaluation,
    handleDeleteEvaluation,
    handleReset,
    handleFileUpload,
    handleSubmit,
  };
};
