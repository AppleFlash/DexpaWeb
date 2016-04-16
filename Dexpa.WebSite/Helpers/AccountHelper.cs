using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Dexpa.WebSite.Helpers
{
    public static class AccountHelper
    {
        public static string GetErrorsListFromModel(ModelStateDictionary stateDictionary)
        {
            string errorString = "";

            foreach (var key in stateDictionary.Keys)
            {
                var errorsList = stateDictionary[key].Errors;
                if (errorsList.Count > 0)
                {
                    foreach (var error in errorsList)
                    {
                        errorString += error.ErrorMessage + " ";
                    }
                }
            }

            return errorString;
        }
    }
}
