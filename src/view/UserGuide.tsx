import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/view/ui/card';
import { Button } from '@/view/ui/button';
import { X } from 'lucide-react';

interface UserGuideProps {
  onClose: () => void;
}

const UserGuide: React.FC<UserGuideProps> = ({ onClose }) => {
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4'>
      <Card className='w-full max-w-3xl h-[90vh] flex flex-col'>
        <CardHeader className='flex flex-row items-center justify-between z-10 border-b'>
          <CardTitle>학기말 성적 생성기 사용 방법</CardTitle>
          <Button
            variant='ghost'
            size='sm'
            onClick={onClose}
            aria-label='Close'
          >
            <X className='h-5 w-5' />
          </Button>
        </CardHeader>
        <CardContent className='space-y-6 text-sm md:text-base overflow-y-auto'>
          <div>
            <p className='font-semibold text-lg mb-2'>
              1. 나이스에서 성적 파일 다운로드
            </p>
            <img
              src='/1.png'
              alt='나이스 접속 안내'
              className='rounded-md border w-full'
            />
            <ol className='list-decimal list-inside mt-4 space-y-2 text-muted-foreground'>
              <li>나이스에 접속합니다.</li>
              <li>[성적] - [학생평가] - [교과평가] 메뉴로 이동합니다.</li>
              <li>교과별 평가 탭을 누르고, 과목을 선택한 후 조회합니다.</li>
            </ol>
          </div>
          <hr />
          <div>
            <img
              src='/2.png'
              alt='XLS 저장 안내'
              className='rounded-md border w-full'
            />
            <ol
              start={4}
              className='list-decimal list-inside mt-4 space-y-2 text-muted-foreground'
            >
              <li>
                저장(💾) 아이콘을 클릭하고, 파일 형식을 'XLS data'로 선택하여
                저장합니다.
              </li>
            </ol>
          </div>
          <hr />
          <div>
            <p className='font-semibold text-lg mb-2'>2. 성적 생성기 사용</p>
            <img
              src='/3.png'
              alt='엑셀 업로드 안내'
              className='rounded-md border w-full'
            />
            <ol
              start={5}
              className='list-decimal list-inside mt-4 space-y-2 text-muted-foreground'
            >
              <li>
                다운로드한 엑셀 파일을 '파일 선택' 버튼을 눌러 업로드합니다.
              </li>
              <li>
                '생성하기' 버튼을 클릭하면 AI가 평가 기록을 생성합니다. (몇 분
                정도 소요될 수 있습니다.)
              </li>
            </ol>
            <ul className='list-disc list-inside mt-4 space-y-2 text-sm text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 rounded-md'>
              <li>
                <strong>중요:</strong> 학생 개인정보(이름, 번호 등)는 서버에
                전송되지 않으니 안심하고 사용하세요.
              </li>
              <li>
                <strong>주의:</strong> 다운로드한 엑셀 파일은 수정하지 말고
                그대로 업로드해야 정상적으로 작동합니다.
              </li>
            </ul>
          </div>
          <div className='text-center text-muted-foreground text-xs pt-4'>
            <p>&copy; 포항원동초등학교 김지원</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserGuide;
