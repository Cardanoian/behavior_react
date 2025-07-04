import { useState, useRef } from 'react';
import { EvaluationItem, ExcelData, SchoolCategory } from '../model';
import { generateExcelFile, readExcelFile } from '../service/excelService';
import { callGeminiApi } from '../service/geminiService';

export const useBehaviorGeneratorViewModel = () => {
  const [schoolCategory, setSchoolCategory] = useState<SchoolCategory>('ele');
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [fileName, setFileName] = useState<string>('');
  const [isUserGuideOpen, setIsUserGuideOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 직접 입력용 상태
  const [inputNumber, setInputNumber] = useState('');
  const [inputCharacteristics, setInputCharacteristics] = useState('');
  const [inputActivity, setInputActivity] = useState('');
  const [promptLength, setPromptLength] = useState<number>(2);
  const [isRandomLength, setIsRandomLength] = useState<boolean>(false);

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
    setInputNumber('');
    setInputCharacteristics('');
    setInputActivity('');
    setFileName('');
    setIsRandomLength(false);
    setPromptLength(2);
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
        const data: ExcelData = await readExcelFile(file, schoolCategory);
        setEvaluations(data.evaluations);
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

    setIsLoading(true);
    const updatedEvaluations = [...evaluations];
    const totalItems = evaluations.length;

    const lengthInstruction = isRandomLength
      ? '3문장 이상 15문장 이하의 길이로 작성합니다.'
      : promptLength === 1
      ? '간결하게 3문장 정도로 작성합니다.'
      : promptLength === 3
      ? '상세하게 10문장 이상, 15문장 이내로 작성합니다.'
      : '5문장~8문장의 보통 길이로 작성합니다.';

    try {
      for (let i = 0; i < evaluations.length; i++) {
        const item = evaluations[i];
        const result = await callGeminiApi(
          item,
          schoolCategory,
          lengthInstruction
        );
        updatedEvaluations[i] = { ...item, result };
        setProgress(Math.round(((i + 1) / totalItems) * 100));
        setEvaluations([...updatedEvaluations]);
      }

      generateExcelFile(updatedEvaluations, schoolCategory);
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
    promptLength,
    setPromptLength,
    isRandomLength,
    setIsRandomLength,
  };
};
