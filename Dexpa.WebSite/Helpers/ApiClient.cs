using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Security;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Web;
using System.Web.Helpers;
using Dexpa.WebSite.Models;
using Newtonsoft.Json;
using NLog;

namespace Dexpa.WebSite.Helpers
{
    public class ApiClient
    {
        private string mServerUrl;

        public string AuthTokenString { get; set; }

        private Logger mLogger = LogManager.GetCurrentClassLogger();

        public ApiClient(string serverUrl)
        {
            mServerUrl = serverUrl;
        }

        public Token GetToken(string login, string password)
        {
            var data = string.Format("UserName={0}&Password={1}&grant_type=password", login, password);
            return ExecuteRequest<Token>(data, "identity", HttpMethod.Post);
        }

        private T ExecuteRequest<T>(object data, string endpoint, HttpMethod method, bool secureRequest = false) where T : class
        {
            ServicePointManager.ServerCertificateValidationCallback =
               delegate(object s, X509Certificate certificate, X509Chain chain, SslPolicyErrors sslPolicyErrors)
               {
                   return true;
               };

            var url = mServerUrl + endpoint;
            using (var client = new HttpClient())
            {
                if (secureRequest)
                {
                    client.DefaultRequestHeaders.Add("Authorization", "Bearer " + AuthTokenString);
                }
                if (method == HttpMethod.Get)
                {
                    var result = client.GetAsync(url);
                    var resultContent = result.Result.Content.ReadAsStringAsync().Result;
                    if (!string.IsNullOrEmpty(resultContent))
                    {
                        var responseData = Json.Decode(resultContent);
                        return responseData;
                    }

                }
                else if (method == HttpMethod.Post)
                {
                    var content = data is string
                        ? data.ToString()
                        : data != null ? Json.Encode(data) : string.Empty;
                    var result = client.PostAsync(url, new StringContent(content, UTF8Encoding.UTF8, "application/json")).Result;
                    var resContent = result.Content.ReadAsStringAsync().Result;
                    if (result.IsSuccessStatusCode)
                    {
                        var responseData = Json.Decode<T>(resContent);
                        return responseData;
                    }
                    else
                    {
                        mLogger.Error("Api error: status: {1}, {0}", resContent, result.StatusCode);
                        throw new Exception(resContent);
                    }
                }
            }
            return null;
        }

        private void ExecuteRequest(object data, string endpoint, HttpMethod method)
        {
            var url = mServerUrl + endpoint;
            var request = HttpWebRequest.Create(url);
            request.Method = method.ToString().ToUpper();
            request.ContentType = "application/json";
            if (data != null)
            {
                var content = Json.Encode(data);
                var bytes = Encoding.UTF8.GetBytes(content);
                request.ContentLength = bytes.Length;
                request.GetRequestStream().Write(bytes, 0, bytes.Length);
            }
            var response = request.GetResponse();
        }

        public void Register(ApiUser apiUser)
        {
            ExecuteRequest<ApiUser>(apiUser, "account/register", HttpMethod.Post);
        }

        public void UpdateUser(ApiUser apiUser)
        {
            ExecuteRequest<ApiUser>(apiUser, "account/update", HttpMethod.Post);
        }

        public void DeleteUser(string userName)
        {
            ExecuteRequest<string>(null, "account/delete?userName="+userName, HttpMethod.Get);
        }
    }

    public enum UserRole
    {
        Admin = 0,
        Driver = 1,
        Dispatcher = 2,
        Cashier = 3,
        PR = 4,
        Mechanic = 5
    }
}