using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Dexpa.WebSite.Helpers
{
    [ComplexType]
    public class Token
    {
        public string access_token;

        public long expires_in;

        public DateTime Created { get; private set; }

        public string TokenString
        {

            get { return access_token; }
        }

        public DateTime ExpirationTime
        {
            get
            {
                return Created.AddSeconds(expires_in);
            }
        }

        public Token()
        {
            Created = DateTime.UtcNow;
        }
    }
}