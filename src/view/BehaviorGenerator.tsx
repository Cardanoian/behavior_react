import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/view/ui/card';
import { Button } from '@/view/ui/button';
import { Input } from '@/view/ui/input';
import { Progress } from '@/view/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/view/ui/table';
import { Label } from '@/view/ui/label';
import { RadioGroup, RadioGroupItem } from '@/view/ui/radio-group';
import {
  Trash2,
  Upload,
  RotateCcw,
  HelpCircle,
  Sparkles,
  Download,
} from 'lucide-react';
import { ThemeToggle } from '@/view/ThemeToggle';
import UserGuide from '@/view/UserGuide';
import { useBehaviorGeneratorViewModel } from '@/viewmodel/useBehaviorGeneratorViewModel';
import { EvaluationItem, SchoolCategory } from '@/model';
import { generateTemplateExcelFile } from '@/service/excelService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const BehaviorGenerator: React.FC = () => {
  const {
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
    promptLength,
    setPromptLength,
    schoolCategory,
    setSchoolCategory,
    handleAddEvaluation,
    handleDeleteEvaluation,
    handleReset,
    handleFileUpload,
    handleSubmit,
  } = useBehaviorGeneratorViewModel();

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* 헤더 */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
              행발 생성기
            </h1>
            <p className='text-muted-foreground mt-2'>
              AI를 활용한 행동특성 및 종합의견
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* 메인 입력 카드 */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Upload className='h-5 w-5' />
              학생 특성 입력
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>학교급</label>
                <div className='flex items-center gap-2'></div>
                <RadioGroup
                  className='flex flex-row gap-4'
                  defaultValue='ele'
                  onValueChange={(e: SchoolCategory) => {
                    handleReset();
                    setSchoolCategory(e);
                  }}
                >
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='kinder' id='kinder-item' />
                    <Label htmlFor='kinder-item'>유치원</Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='ele' id='ele-item' />
                    <Label htmlFor='ele-item'>초등학교</Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='mid' id='mid-item' />
                    <Label htmlFor='mid-item'>중,고등학교</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>엑셀 파일</label>
                <div className='flex items-center gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className='gap-2'
                  >
                    <Upload className='h-4 w-4' />
                    파일 선택
                  </Button>
                  <p className='text-sm text-muted-foreground'>
                    {fileName || '선택된 파일 없음'}
                  </p>
                  <Input
                    type='file'
                    accept='.xlsx, .xls'
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFileUpload(e)
                    }
                    disabled={isLoading}
                    ref={fileInputRef}
                    className='hidden'
                  />
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='flex flex-wrap gap-3'>
                <Button
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                    handleSubmit(e)
                  }
                  disabled={evaluations.length === 0 || isLoading}
                  className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white min-w-30'
                >
                  {isLoading ? <></> : <Sparkles />}
                  {isLoading ? `처리 중... ${progress}%` : '생성하기'}
                </Button>

                <Button
                  onClick={() => generateTemplateExcelFile(schoolCategory)}
                  variant='outline'
                  disabled={isLoading}
                  className='gap-2 min-w-30'
                >
                  <Download className='h-4 w-4' />
                  서식파일
                </Button>

                <Button
                  onClick={handleReset}
                  variant='outline'
                  disabled={isLoading}
                  className='gap-2 min-w-30'
                >
                  <RotateCcw className='h-4 w-4' />
                  초기화
                </Button>

                <Button
                  onClick={() => setIsUserGuideOpen(true)}
                  variant='outline'
                  disabled={isLoading}
                  className='gap-2 min-w-30'
                >
                  <HelpCircle className='h-4 w-4' />
                  사용방법
                </Button>
              </div>

              <div className='space-y-2 flex flex-wrap gap-3 items-center'>
                <label className='text-sm font-medium'>생성 길이</label>
                <Select
                  value={promptLength}
                  onValueChange={(value: '짧게' | '보통' | '길게') =>
                    setPromptLength(value)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className='w-[120px]'>
                    <SelectValue placeholder='길이 선택' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='짧게'>짧게</SelectItem>
                    <SelectItem value='보통'>보통</SelectItem>
                    <SelectItem value='길게'>길게</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading && (
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span>진행률</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className='w-full' />
              </div>
            )}
          </CardContent>
        </Card>

        {/* 데이터 개별 추가 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>데이터 개별 추가</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`grid grid-cols-1 ${
                schoolCategory === 'kinder'
                  ? 'md:grid-cols-4'
                  : 'md:grid-cols-3'
              } gap-3 items-end`}
            >
              <div className='space-y-2'>
                <label className='text-sm font-medium'>번호</label>
                <Input
                  type='text'
                  value={inputNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setInputNumber(e.target.value)
                  }
                  placeholder='번호'
                  disabled={isLoading}
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>학생 특성</label>
                <Input
                  type='text'
                  value={inputCharacteristics}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setInputCharacteristics(e.target.value)
                  }
                  placeholder='만들기를 좋아하고 자연물로 그림 그리는 것을 즐김. 친구에게 선물하는 것을 좋아함.'
                  disabled={isLoading}
                />
              </div>
              {schoolCategory === 'kinder' && (
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>놀이 활동</label>
                  <Input
                    type='text'
                    value={inputActivity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setInputActivity(e.target.value)
                    }
                    placeholder='산책 시간에 돌멩이나 꽃잎을 주워서 미술 활동에 사용함.'
                    disabled={isLoading}
                  />
                </div>
              )}
              <Button
                onClick={handleAddEvaluation}
                disabled={isLoading}
                className='h-10'
              >
                추가
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 행동발달 및 종합의견 테이블 */}
        {evaluations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>행동발달 및 종합의견</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='rounded-md border'>
                <Table className='w-full table-fixed'>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-16 text-center'>삭제</TableHead>
                      <TableHead className='w-16 text-center'>번호</TableHead>
                      <TableHead className='w-[30%] text-center'>
                        학생 특성
                      </TableHead>
                      <TableHead className='w-auto text-center'>
                        행동발달 및 종합의견
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evaluations.map((item: EvaluationItem, index: number) => (
                      <TableRow key={index}>
                        <TableCell className='text-center'>
                          <Button
                            variant='destructive'
                            size='sm'
                            onClick={() => handleDeleteEvaluation(index)}
                            className='h-8 w-8 p-0'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </TableCell>
                        <TableCell className='text-center'>
                          {item.number}
                        </TableCell>
                        <TableCell className='p-2 align-middle break-keep text-center'>
                          {item.characteristics}
                        </TableCell>
                        <TableCell className='p-2 align-middle whitespace-pre-wrap break-keep text-center'>
                          {item.result}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 푸터 */}
        <div className='text-center text-muted-foreground text-sm py-8'>
          <p>포항원동초등학교</p>
          <p>교사 김지원 제작</p>
        </div>
      </div>
      {isUserGuideOpen && (
        <UserGuide onClose={() => setIsUserGuideOpen(false)} />
      )}
    </div>
  );
};

export default BehaviorGenerator;
