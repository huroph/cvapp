export const UserType = {
  CANDIDAT: 'candidat',
  RECRUTEUR: 'recruteur'
} as const;

export type UserType = typeof UserType[keyof typeof UserType];

export const USER_TYPE_LABELS = {
  [UserType.CANDIDAT]: 'Candidat',
  [UserType.RECRUTEUR]: 'Recruteur'
} as const;

export interface UserTypeOption {
  value: UserType;
  label: string;
  description: string;
  icon: string;
}

export const USER_TYPE_OPTIONS: UserTypeOption[] = [
  {
    value: UserType.CANDIDAT,
    label: USER_TYPE_LABELS[UserType.CANDIDAT],
    description: 'Je cherche un emploi et veux créer mon CV',
    icon: '👤'
  },
  {
    value: UserType.RECRUTEUR,
    label: USER_TYPE_LABELS[UserType.RECRUTEUR],
    description: 'Je recrute et consulte des CVs',
    icon: '🏢'
  }
];