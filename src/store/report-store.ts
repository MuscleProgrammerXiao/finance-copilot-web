import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BasicInfoData {
  reportNature: string;
  reportCycle: string;
  reportType: string;
  currency: string;
  reportPeriod: string; // YYYYMM
}

export interface AuditInfoData {
  amountUnit: string;
  decimalPlaces: string;
  isAudited: string; // 'yes' | 'no'
  auditDate?: string; // Storing as string (ISO) for persistence simplicity
  reportNumber?: string;
  auditFirm?: string;
  auditOpinion?: string;
  verificationCode?: string;
  noAuditReason?: string;
}

interface ReportStore {
  basicInfo: BasicInfoData;
  auditInfo: AuditInfoData;
  reportId: string | null;
  isBasicSubmitted: boolean;
  isAuditSubmitted: boolean;

  submittedBasicInfo: BasicInfoData | null;
  submittedAuditInfo: AuditInfoData | null;

  isVerifyOpen: boolean;
  isImportOpen: boolean;
  importData: any | null; // Store imported files data
  setVerifyOpen: (val: boolean) => void;
  setImportOpen: (val: boolean) => void;
  setImportData: (data: any) => void;

  setBasicInfo: (data: Partial<BasicInfoData>) => void;
  setAuditInfo: (data: Partial<AuditInfoData>) => void;
  setReportId: (id: string) => void;
  setBasicSubmitted: (val: boolean) => void;
  setAuditSubmitted: (val: boolean) => void;
  reset: () => void;
  commitToSubmitted: () => void;
  loadSubmitted: () => void;
}

const initialBasicInfo: BasicInfoData = {
  reportNature: '',
  reportCycle: '',
  reportType: '',
  currency: '',
  reportPeriod: '',
};

const initialAuditInfo: AuditInfoData = {
  amountUnit: 'yuan',
  decimalPlaces: '0',
  isAudited: 'yes',
  reportNumber: '',
  auditFirm: '',
  auditOpinion: '',
  verificationCode: '',
  noAuditReason: '',
};

export const useReportStore = create<ReportStore>()(
  persist(
    (set) => ({
      basicInfo: initialBasicInfo,
      auditInfo: initialAuditInfo,
      reportId: null,
      isBasicSubmitted: false,
      isAuditSubmitted: false,
      isVerifyOpen: false,
      isImportOpen: false,
      importData: null,
      submittedBasicInfo: null,
      submittedAuditInfo: null,

      setBasicInfo: (data) => set((state) => ({ basicInfo: { ...state.basicInfo, ...data } })),
      setAuditInfo: (data) => set((state) => ({ auditInfo: { ...state.auditInfo, ...data } })),
      setReportId: (id) => set({ reportId: id }),
      setBasicSubmitted: (val) => set({ isBasicSubmitted: val }),
      setAuditSubmitted: (val) => set({ isAuditSubmitted: val }),
      setVerifyOpen: (val) => set({ isVerifyOpen: val }),
      setImportOpen: (val) => set({ isImportOpen: val }),
      setImportData: (data) => set({ importData: data }),
      reset: () => set({
        basicInfo: initialBasicInfo,
        auditInfo: initialAuditInfo,
        reportId: null,
        isBasicSubmitted: false,
        isAuditSubmitted: false,
        isVerifyOpen: false,
        isImportOpen: false,
        importData: null,
      }),
      commitToSubmitted: () => set((state) => ({
        submittedBasicInfo: state.basicInfo,
        submittedAuditInfo: state.auditInfo
      })),
      loadSubmitted: () => set((state) => {
        if (state.submittedBasicInfo) {
          return {
            basicInfo: state.submittedBasicInfo,
            auditInfo: state.submittedAuditInfo || initialAuditInfo,
            isBasicSubmitted: true,
            isAuditSubmitted: !!state.submittedAuditInfo,
            isVerifyOpen: false,
            isImportOpen: false,
            importData: null,
          };
        }
        // If no submitted info, reset to initial to clear any draft
        return {
          basicInfo: initialBasicInfo,
          auditInfo: initialAuditInfo,
          reportId: null,
          isBasicSubmitted: false,
          isAuditSubmitted: false,
          isVerifyOpen: false,
          isImportOpen: false,
          importData: null,
        };
      }),
    }),
    {
      name: 'report-store',
    }
  )
);
