export class CreateUserDto {
  id?: string;
  email: string;
  name?: string;
  createdAt?: Date;
  university?: string;
  fieldOfStudy?: string;
  image?: string;
  dateOfBirth: Date;
  currentFieldOfStudy?: string;
}
