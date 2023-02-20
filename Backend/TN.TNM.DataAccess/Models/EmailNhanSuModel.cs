using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Databases.Entities;

namespace TN.TNM.DataAccess.Models
{
    public class EmailNhanSuModel : BaseModel<EmailNhanSu>
    {
        public int? EmailNhanSuId { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }

        public EmailNhanSuModel()
        {

        }

        //Map từ Entity => Model
        public EmailNhanSuModel(EmailNhanSu entity)
        {
            Mapper(entity, this);
        }

        //Map từ Model => Entity
        public override EmailNhanSu ToEntity()
        {
            var entity = new EmailNhanSu();
            Mapper(this, entity);
            return entity;
        }
    }
}
