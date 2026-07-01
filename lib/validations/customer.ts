export type CustomerInput = {
  name: string;
  phone: string;
  memo: string | null;
};

export type CustomerField = keyof CustomerInput | "privacyConsent";

export type CustomerErrors = Partial<Record<CustomerField, string>>;

const NAME_MIN = 2;
const NAME_MAX = 30;
const MEMO_MAX = 500;

const PHONE_PATTERN = /^01[0-9][0-9\- ]?[0-9]{3,4}[\- ]?[0-9]{4}$/;

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatPhone(value: string): string {
  const digits = normalizePhone(value);

  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return value.trim();
}

export function validateCustomer(
  input: CustomerInput,
): { success: true; data: CustomerInput } | {
  success: false;
  errors: CustomerErrors;
} {
  const errors: CustomerErrors = {};
  const name = input.name.trim();
  const phone = input.phone.trim();
  const memo = input.memo?.trim() || null;

  if (!name) {
    errors.name = "이름을 입력해 주세요.";
  } else if (name.length < NAME_MIN) {
    errors.name = `이름은 ${NAME_MIN}자 이상 입력해 주세요.`;
  } else if (name.length > NAME_MAX) {
    errors.name = `이름은 ${NAME_MAX}자 이하로 입력해 주세요.`;
  } else if (!/^[가-힣a-zA-Z\s]+$/.test(name)) {
    errors.name = "이름은 한글 또는 영문만 입력 가능합니다.";
  }

  if (!phone) {
    errors.phone = "연락처를 입력해 주세요.";
  } else if (!PHONE_PATTERN.test(phone)) {
    errors.phone = "올바른 휴대폰 번호 형식이 아닙니다. (예: 010-1234-5678)";
  } else {
    const digits = normalizePhone(phone);
    if (digits.length < 10 || digits.length > 11) {
      errors.phone = "올바른 휴대폰 번호 형식이 아닙니다.";
    }
  }

  if (memo && memo.length > MEMO_MAX) {
    errors.memo = `문의내용은 ${MEMO_MAX}자 이하로 입력해 주세요.`;
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      name,
      phone: formatPhone(phone),
      memo,
    },
  };
}

export function parseCustomerFormData(formData: FormData): CustomerInput {
  return {
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    memo: String(formData.get("memo") ?? ""),
  };
}

export function isPrivacyConsentGiven(formData: FormData): boolean {
  const value = formData.get("privacy_consent");
  return value === "yes" || value === "on" || value === "true";
}

export function validatePrivacyConsent(formData: FormData): CustomerErrors {
  if (isPrivacyConsentGiven(formData)) {
    return {};
  }
  return { privacyConsent: "개인정보 수집 및 이용에 동의해 주세요." };
}
