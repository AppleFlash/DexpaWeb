using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Web.Mvc;

namespace Dexpa.WebSite.Models
{
    public class ExternalLoginConfirmationViewModel
    {
        [Required]
        [Display(Name = "Логин")]
        public string UserName { get; set; }
    }

    public class ManageUserViewModel
    {
        [Required]
        [Display(Name = "Фамилия")]
        public string LastName { get; set; }

        [Required]
        [Display(Name = "Имя")]
        public string Name { get; set; }

        [Display(Name = "Отчество")]
        public string MiddleName { get; set; }

        [Required]
        [Display(Name = "Роль")]
        public string Role { get; set; }

        [RegularExpression(@"^[0-9]+$", ErrorMessage = "Некорректный номер телефона.")]
        [Display(Name = "Телефон")]
        public string PhoneNumber { get; set; }

        [DataType(DataType.EmailAddress)]
        [EmailAddress(ErrorMessage = "Некорректный Email.")]
        [Display(Name = "Email")]
        public string Email { get; set; }
        [Required]
        [Display(Name = "Доступ разрешен")]
        public bool HasAccess { get; set; }

        [Required]
        [Display(Name = "Имя пользователя")]
        public string UserName { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "Текущий пароль")]
        public string OldPassword { get; set; }

        [StringLength(100, ErrorMessage = "Пароль должен иметь длину минимум {2} символов.", MinimumLength = 6)]
        [DataType(DataType.Password)]
        [Display(Name = "Новый пароль")]
        public string NewPassword { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "Подтверждение")]
        [System.ComponentModel.DataAnnotations.Compare("NewPassword", ErrorMessage = "Пароли не совпадают.")]
        public string ConfirmPassword { get; set; }

        [Display(Name = "Логин")]
        public string IpPhoneLogin { get; set; }

        [Display(Name = "Пароль")]
        public string IpPhonePassword { get; set; }

        [Display(Name = "Провайдер")]
        public string IpPhoneProvider { get; set; }

        public string UserId { get; set; }

        public string Error { get; set; }
    }

    public class LoginViewModel
    {
        [Required]
        [Display(Name = "Логин")]
        public string UserName { get; set; }

        [Required]
        [DataType(DataType.Password)]
        [Display(Name = "Пароль")]
        public string Password { get; set; }

        [Display(Name = "Запомнить?")]
        public bool RememberMe { get; set; }
    }

    public class RegisterViewModel
    {
        [Required]
        [Display(Name = "Фамилия")]
        public string LastName { get; set; }

        [Required]
        [Display(Name = "Имя")]
        public string Name { get; set; }

        [Display(Name = "Отчество")]
        public string MiddleName { get; set; }

        [Required]
        [Display(Name = "Роль")]
        public string Role { get; set; }

        [RegularExpression(@"^[0-9]+$", ErrorMessage = "Некорректный номер телефона.")]
        [Display(Name = "Телефон")]
        public string PhoneNumber { get; set; }

        [EmailAddress(ErrorMessage = "Некорректный Email.")]
        [DataType(DataType.EmailAddress)]
        [Display(Name = "Email")]
        public string Email { get; set; }

        [Required]
        [Display(Name = "Доступ разрешен")]
        public bool HasAccess { get; set; }

        [Required]
        [Display(Name = "Логин")]
        public string UserName { get; set; }

        [Required]
        [StringLength(100, ErrorMessage = "Пароль должен иметь длину минимум {2} символов.", MinimumLength = 6)]
        [DataType(DataType.Password)]
        [Display(Name = "Пароль")]
        public string Password { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "Подтверждение")]
        [System.ComponentModel.DataAnnotations.Compare("Password", ErrorMessage = "Пароли не совпадают.")]
        public string ConfirmPassword { get; set; }

        [Display(Name = "Логин")]
        public string IpPhoneLogin { get; set; }

        [Display(Name = "Пароль")]
        public string IpPhonePassword { get; set; }

        [Display(Name = "Провайдер")]
        public string IpPhoneProvider { get; set; }

        public string Error { get; set; }
    }
}
