import { AsyncPipe, JsonPipe, NgIf } from "@angular/common";
import { ChangeDetectorRef, Component, inject } from "@angular/core";
import {
  FormControl, FormGroup, ReactiveFormsModule, Validators
} from "@angular/forms";
import { tuiMarkControlAsTouchedAndValidate, } from "@taiga-ui/cdk";
import { TuiButton, TuiError } from "@taiga-ui/core";
import { TUI_VALIDATION_ERRORS, TuiFieldErrorPipe } from "@taiga-ui/kit";
import { TuiInputModule } from "@taiga-ui/legacy";

import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-sign-up",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TuiInputModule,
    TuiError,
    TuiFieldErrorPipe,
    AsyncPipe,
    TuiButton,
    NgIf,
    JsonPipe
  ],
  providers: [
    {
      provide: TUI_VALIDATION_ERRORS,
      useValue: {
        required: "This field is required",
        pattern: "Enter correct email",
        minlength: "Password must be at least 8 characters long",
        passwordsDoNotMatch: "Passwords do not match"
      }
    }
  ],
  templateUrl: "./sign-up.component.html",
  styleUrl: "./sign-up.component.scss"
})
export class SignUpComponent {
  private readonly cdr = inject(ChangeDetectorRef);
  readonly authService = inject(AuthService);
  theFormHasBeenSubmitted = false;

  readonly signUpForm = new FormGroup({
    email: new FormControl(
      "",
      {
        validators: [Validators.required, Validators.pattern("^[\\w\\d_]+@[\\w\\d_]+.\\w{2,7}$")],
        nonNullable: true
      }
    ),
    password: new FormControl("", { validators: [Validators.required, Validators.minLength(8)], nonNullable: true }),
    repeatPassword: new FormControl(
      "",
      { validators: [Validators.required, Validators.minLength(8)], nonNullable: true }
    ),
  });

  onFormSubmitHandler() {
    this.theFormHasBeenSubmitted = true;

    tuiMarkControlAsTouchedAndValidate(this.signUpForm);
    this.cdr.detectChanges(); // fix ExpressionChangedAfterItHasBeenCheckedError

    if (this.checkPasswordDoesNotMatch()) {
      this.signUpForm.controls.repeatPassword.setErrors({ passwordsDoNotMatch: true });
    }

    if (this.signUpForm.valid) {
      const email = this.signUpForm.get("email")?.value as string;
      const password = this.signUpForm.get("password")?.value as string;
      this.authService.signUp(email, password);
    }
  }

  checkPasswordDoesNotMatch(): boolean {
    return this.signUpForm.get("password")?.value !== this.signUpForm.get("repeatPassword")?.value;
  }
}
