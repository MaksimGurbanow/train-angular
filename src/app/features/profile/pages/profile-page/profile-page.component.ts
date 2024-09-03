/* eslint-disable class-methods-use-this */
import { AsyncPipe, NgIf } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import {
  FormControl, FormGroup, ReactiveFormsModule, Validators
} from "@angular/forms";
import {
  TuiButton, TuiError, TuiIcon, TuiIconPipe
} from "@taiga-ui/core";
import { TUI_VALIDATION_ERRORS, TuiFieldErrorPipe } from "@taiga-ui/kit";
import { TuiInputModule } from "@taiga-ui/legacy";

import { UserService } from "../../services/user.service";

@Component({
  selector: "app-profile-page",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TuiInputModule,
    TuiButton,
    TuiIcon,
    TuiError,
    TuiFieldErrorPipe,
    TuiIconPipe,
    AsyncPipe,
    NgIf,
  ],
  templateUrl: "./profile-page.component.html",
  styleUrl: "./profile-page.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
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
})
export class ProfileComponent {
  protected readonly userService = inject(UserService);
  protected readonly profileForm = new FormGroup({
    email: new FormControl("", {
      validators: [
        Validators.required,
        Validators.pattern("^[\\w\\d_]+@[\\w\\d_]+.\\w{2,7}$"),
      ],
      nonNullable: true,
    }),
    name: new FormControl("", { nonNullable: true }),
  });

  protected readonly newPassword = new FormControl("", {
    validators: [Validators.required, Validators.minLength(8)],
    nonNullable: true,
  });

  protected readonly emailIsEditable = signal(false);
  protected readonly nameIsEditable = signal(false);
  protected readonly passwordIsEditable = signal(false);

  constructor() {
    this.userService.userProfile.subscribe((user) => {
      if (user) {
        this.profileForm.setValue({ email: user.email, name: user.name });
      }
    });
    this.userService.getUser();
  }

  public handleClick(field: "email" | "name" | "password") {
    if (field === "email") {
      if (this.emailIsEditable() && this.profileForm.valid) {
        this.userService.updateUser({
          email: this.profileForm.get("email")?.value,
        });
      }
      this.emailIsEditable.set(!this.emailIsEditable());
    }
    if (field === "name") {
      if (this.nameIsEditable() && this.profileForm.valid) {
        this.userService.updateUser({
          name: this.profileForm.get("name")?.value,
        });
      }
      this.nameIsEditable.set(!this.nameIsEditable());
    }
    if (field === "password") {
      this.passwordIsEditable.set(!this.passwordIsEditable());
    }
  }

  public handleLogout() {
    this.userService.logout();
  }

  public handlePasswordChange() {
    if (this.newPassword.valid) {
      this.userService.updatePassword(this.newPassword.value).add(() => {
        this.passwordIsEditable.set(false);
      });
    }
  }

  public stopPropagation(e: Event) {
    e.stopPropagation();
  }
}
