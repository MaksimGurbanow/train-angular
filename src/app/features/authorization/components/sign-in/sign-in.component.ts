import { AsyncPipe, JsonPipe, NgIf } from "@angular/common";
import { ChangeDetectorRef, Component, inject } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { tuiMarkControlAsTouchedAndValidate } from "@taiga-ui/cdk";
import { TuiButton, TuiError } from "@taiga-ui/core";
import { TUI_VALIDATION_ERRORS, TuiFieldErrorPipe } from "@taiga-ui/kit";
import { TuiInputModule } from "@taiga-ui/legacy";

import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-sign-in",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TuiInputModule,
    TuiError,
    TuiFieldErrorPipe,
    AsyncPipe,
    TuiButton,
    NgIf,
    JsonPipe,
  ],
  providers: [
    {
      provide: TUI_VALIDATION_ERRORS,
      useValue: {
        required: "This field is required",
        pattern: "Enter correct email",
        minlength: "Password must be at least 8 characters long",
      },
    },
  ],
  templateUrl: "./sign-in.component.html",
  styleUrl: "./sign-in.component.scss",
})
export class SignInComponent {
  theFormHasBeenSubmitted = false;
  private readonly cdr = inject(ChangeDetectorRef);
  readonly authService = inject(AuthService);

  readonly signInForm = new FormGroup({
    email: new FormControl(
      "",
      {
        validators: [Validators.required, Validators.pattern("^[\\w\\d_]+@[\\w\\d_]+.\\w{2,7}$")],
        nonNullable: true
      }
    ),
    password: new FormControl(
      "",
      {
        validators: [Validators.required, Validators.minLength(8)],
        nonNullable: true
      }
    ),

  });

  onFormSubmitHandler() {
    this.theFormHasBeenSubmitted = true;

    tuiMarkControlAsTouchedAndValidate(this.signInForm);
    this.cdr.detectChanges(); // fix ExpressionChangedAfterItHasBeenCheckedError

    if (this.signInForm.valid) {
      const email = this.signInForm.get("email")?.value as string;
      const password = this.signInForm.get("password")?.value as string;
      this.authService.signIn(email, password);
    }
  }
}
