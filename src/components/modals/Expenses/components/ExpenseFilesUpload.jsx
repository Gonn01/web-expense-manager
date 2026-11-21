import Icon from '@/components/Icon';
import { t } from '@/i18n';

export default function ExpenseFilesUpload({ setFiles }) {
    return (
        <div>
            <p className="text-slate-900 dark:text-white text-sm font-medium pb-2">
                {t('modals.attachImages')}
            </p>

            <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-32 
                           border-2 border-slate-300 dark:border-[#3d5245] border-dashed rounded-lg bg-slate-50 dark:bg-[#1c2620] 
                           hover:bg-slate-100 dark:hover:bg-[#29382f] cursor-pointer transition-colors"
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Icon
                        name="cloud_upload"
                        className="text-4xl text-slate-500 dark:text-[#9eb7a8]"
                    />
                    <p className="mb-2 text-sm text-slate-500 dark:text-[#9eb7a8]">
                        <span className="font-semibold text-primary">
                            {t('modals.clickOrDrag')}
                        </span>
                    </p>
                    <p className="text-xs text-gray-500">{t('modals.pngJpgOrPdfMax5mb')}</p>
                </div>

                <input
                    id="dropzone-file"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => setFiles(e.target.files)}
                />
            </label>
        </div>
    );
}
