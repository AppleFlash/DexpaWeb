using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Dexpa.WebSite.Models;
using Microsoft.Ajax.Utilities;
using Microsoft.AspNet.Identity;
using Microsoft.Owin.Security;
using NLog;

namespace Dexpa.WebSite.Helpers
{
    public class AccountManager
    {
        private IAuthenticationManager mAuthenticationManager;

        private UserManager<User> mUserManager;

        private ApplicationDbContext mContext;

        private ApiClient mApiClient;

        private Logger mLogger = LogManager.GetCurrentClassLogger();

        public AccountManager(IAuthenticationManager authenticationManager,
            UserManager<User> userManager,
            ApiClient apiClient,
            ApplicationDbContext context)
        {
            mAuthenticationManager = authenticationManager;
            mUserManager = userManager;
            mApiClient = apiClient;
            mContext = context;
        }

        public async Task AddUser(User user, string password, string role)
        {
            if (mUserManager.FindByName(user.UserName) != null)
            {
                var error = string.Format("Пользователь с именем {0} уже существует.", user.UserName);
                throw new InvalidOperationException(error);
            }

            var createResult = await mUserManager.CreateAsync(user, password);
            if (createResult.Succeeded)
            {
                var addToRoleResult = await mUserManager.AddToRoleAsync(user.Id, role);
                if (addToRoleResult.Succeeded)
                {
                    mLogger.Debug("User registred successful {0}", user.Id);
                    try
                    {
                        var apiUser = new ApiUser
                        {
                            LastName = user.LastName,
                            MiddleName = user.MiddleName,
                            Name = user.Name,
                            UserName = user.UserName,
                            Password = password,
                            Role = RoleHelper.RoleFromString(role),
                            IpUserName = user.IpUserName,
                            IpPassword = user.IpPassword,
                            IpProvider = user.IpProvider
                        };
                        mApiClient.Register(apiUser);
                    }
                    catch
                    {
                        var res = mUserManager.RemoveFromRoleAsync(user.Id, role);
                        mContext.Entry(user).State = EntityState.Deleted;
                        mContext.SaveChanges();

                        throw new InvalidOperationException("Не удалось зарегистрировать пользователя");
                    }
                }
                else
                {
                    var error = addToRoleResult.Errors.Aggregate("", (current, e) => current + e);
                    throw new InvalidOperationException(error);
                }
            }
            else
            {
                var error = createResult.Errors.Aggregate("", (current, e) => current + e);
                throw new InvalidOperationException(error);
            }
        }

        public async Task UpdateUser(string userId, string userName, string lastName, string password, string middleName,
            string name, string phone, string email, string role, bool hasAccess,
            string ipUserName, string ipPassword, string ipProvider)
        {
            var user = mContext.Users.FirstOrDefault(u => u.Id == userId);

            if (user == null)
            {
                throw new InvalidOperationException("Пользователь не существует");
            }

            var oldUserName = user.UserName;

            user.Email = email;
            user.HasAccess = hasAccess;
            user.LastName = lastName;
            user.MiddleName = middleName;
            user.Name = name;
            user.PhoneNumber = phone;
            user.IpUserName = ipUserName;
            user.IpPassword = ipPassword;
            user.IpProvider = ipProvider;
            user.UserName = userName;

            var userRole = user.Roles.FirstOrDefault();

            try
            {
                if (userRole != null)
                {
                    var result = mUserManager.RemoveFromRole(user.Id, userRole.Role.Name);

                    if (!result.Succeeded)
                    {
                        var error = result.Errors.Aggregate("", (current, e) => current + e);
                        throw new InvalidOperationException(error);
                    }
                }
                var updateRoleResult = mUserManager.AddToRole(user.Id, role);

                if (!updateRoleResult.Succeeded)
                {
                    if (userRole != null)
                    {
                        //Пытаемся вернуть старую роль
                        mUserManager.AddToRole(user.Id, userRole.Role.Name);
                    }

                    var error = updateRoleResult.Errors.Aggregate("", (current, e) => current + e);
                    throw new InvalidOperationException(error);
                }
                var apiUser = new ApiUser
                    {
                        LastName = lastName,
                        MiddleName = middleName,
                        Name = name,
                        Password = password,
                        Role = RoleHelper.RoleFromString(role),
                        UserName = userName,
                        OldUserName = oldUserName,
                        IpUserName = ipUserName,
                        IpPassword = ipPassword,
                        IpProvider = ipProvider
                    };

                var changePassword = !string.IsNullOrEmpty(password);
                if (changePassword)
                {
                    var passwordValidResult = await mUserManager.PasswordValidator.ValidateAsync(password);

                    if (!passwordValidResult.Succeeded)
                    {
                        var error = passwordValidResult.Errors.Aggregate("", (current, e) => current + e);
                        throw new InvalidOperationException(error);
                    }
                }
                mLogger.Debug("User registred on site");
                mApiClient.UpdateUser(apiUser);

                //Здесь может быть так, что в апи пароль обновиться, а на сайте нет (по каким-то причинам). Маловероятно, но может
                if (changePassword)
                {
                    var result = await mUserManager.RemovePasswordAsync(user.Id);
                    result = await mUserManager.AddPasswordAsync(user.Id, password);
                    if (!result.Succeeded)
                    {
                        var error = result.Errors.Aggregate("", (current, e) => current + e);
                        throw new InvalidOperationException(error);
                    }
                }
                await mContext.SaveChangesAsync();
            }
            catch
            {
                mContext.Entry(user).Reload();

                throw;
            }
        }

        public async Task DeleteUser(string userId)
        {
            var user = mContext.Users.FirstOrDefault(u => u.Id == userId);
            if (user != null)
            {
                try
                {
                    mContext.Entry(user).State = EntityState.Deleted;

                    mApiClient.DeleteUser(user.UserName);

                    await mContext.SaveChangesAsync();
                }
                catch
                {
                    mContext.Entry(user).Reload();
                    throw new InvalidOperationException("Не удалось удалить пользователя");
                }

            }
            else
            {
                throw new InvalidOperationException("Пользователь не существует");
            }
        }

        public async Task<User> SignIn(string userName, string password, bool isPersistent)
        {
            var user = mUserManager.Find(userName, password);

            if (user != null)
            {
                await SignOut();
                var identity =
                    await mUserManager.CreateIdentityAsync(user, DefaultAuthenticationTypes.ApplicationCookie);
                var properties = new AuthenticationProperties() { IsPersistent = isPersistent };
                mAuthenticationManager.SignIn(properties, identity);

                if (await RefreshUserToken(user, userName, password) == false)
                {
                    await SignOut();
                }
            }
            return user;
        }

        public string GetUserRole(User user)
        {
            foreach (var userRole in user.Roles)
            {
                return userRole.Role.Name;
            }
            return string.Empty;
        }

        private async Task<bool> RefreshUserToken(User user, string userName, string password)
        {
            try
            {
                var token = mApiClient.GetToken(userName, password);
                user.Token.ExpirationDate = token.ExpirationTime;
                user.Token.Token = token.TokenString;

                var result = await mUserManager.UpdateAsync(user);

                return result.Succeeded;
            }
            catch
            {
                return false;
            }
        }


        public async Task SignOut()
        {
            mAuthenticationManager.SignOut(DefaultAuthenticationTypes.ExternalCookie);

        }
    }
}