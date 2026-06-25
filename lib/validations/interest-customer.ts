export const INTEREST_TYPES = [
  "분양문의",
  "방문예약",
  "상담요청",
  "모델하우스",
] as const;

export type InterestType = (typeof INTEREST_TYPES)[number];

export type InterestCustomerInput = {
  name: string;
  phone: string;
  type: string | null;
  visit_date: string | null;
  memo: string | null;
};

export type InterestCustomerField = keyof InterestCustomerInput;

export type InterestCustomerErrors = Partial<
  Record<InterestCustomerField, string>
>;

const NAME_MIN = 2;
const NAME_MAX = 30;
const MEMO_MAX = 500;

const PHONE_PATTERN = /^01[0-9][0-9\- ]?[0-9]{3,4}[\- ]?[0-9]{4}$/;

function isValidInterestType(value: string): value is InterestType {
  return (INTEREST_TYPES as readonly string[]).includes(value);
}

function normalizePhone(value: string): string {
  return value.replace(/[^\d]/g, "");
}

function isFutureOrToday(dateString: string): boolean {
  const input = new Date(`${dateString}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return input >= today;
}

export function validateInterestCustomer(
  input: InterestCustomerInput,
): { success: true; data: InterestCustomerInput } | {
  success: false;
  errors: InterestCustomerErrors;
} {
  const errors: InterestCustomerErrors = {};
  const name = input.name.trim();
  const phone = input.phone.trim();
  const type = input.type?.trim() || null;
  const visit_date = input.visit_date?.trim() || null;
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

  if (type && !isValidInterestType(type)) {
    errors.type = "관심 유형을 올바르게 선택해 주세요.";
  }

  if (visit_date) {
    const parsed = new Date(`${visit_date}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      errors.visit_date = "방문 희망일 형식이 올바르지 않습니다.";
    } else if (!isFutureOrToday(visit_date)) {
      errors.visit_date = "방문 희망일은 오늘 이후 날짜만 선택 가능합니다.";
    }
  }

  if (memo && memo.length > MEMO_MAX) {
    errors.memo = `메모는 ${MEMO_MAX}자 이하로 입력해 주세요.`;
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      name,
      phone: formatPhone(phone),
      type,
      visit_date,
      memo,
    },
  };
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

export function parseInterestCustomerFormData(
  formData: FormData,
): InterestCustomerInput {
  return {
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    type: String(formData.get("type") ?? "").trim() || null,
    visit_date: String(formData.get("visit_date") ?? "").trim() || null,
    memo: String(formData.get("memo") ?? ""),
  };
}
