export type SignInFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
      data: {
        email?: string;
        password?: string;
      };
    }
  | undefined;

export type SignUpFormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
      data?: {
        name?: string;
        email?: string;
        password?: string;
      };
    }
  | undefined;

export type UpdateProfileFormState =
  | {
      errors?: {
        name?: string[];
        password?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;
