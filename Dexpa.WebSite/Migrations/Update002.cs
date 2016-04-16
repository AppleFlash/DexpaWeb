namespace Dexpa.WebSite.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Update002 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.AspNetUsers", "Token_Token", c => c.String());
            AddColumn("dbo.AspNetUsers", "Token_ExpirationDate", c => c.DateTime());
            DropColumn("dbo.AspNetUsers", "OldUserName");
        }
        
        public override void Down()
        {
            AddColumn("dbo.AspNetUsers", "OldUserName", c => c.String());
            DropColumn("dbo.AspNetUsers", "Token_ExpirationDate");
            DropColumn("dbo.AspNetUsers", "Token_Token");
        }
    }
}
