'use strict';

function defined(ref, strNames) {
    var name;

    if(ref === null || typeof ref === "undefined") {
      //console.log('defined, ref null!');
      return false;
    }

    if(strNames !== null && typeof strNames !== "undefined") {
      var arrNames = strNames.split('.');
      while (name = arrNames.shift()) {
          //console.log('defined, name:' + name);
          if (ref[name] === null || typeof ref[name] === "undefined") {
            return false;
          }
          ref = ref[name];
      }
    }
    return true;
}

function getValue(ref, strNames) {
    var name;

    if(ref === null || typeof ref === "undefined") {
      //console.log('defined, ref null!');
      return null;
    }

    if(strNames !== null && typeof strNames !== "undefined") {
      var arrNames = strNames.split('.');
      while (name = arrNames.shift()) {
          //console.log('defined, name:' + name);
          if (ref[name] === null || typeof ref[name] === "undefined") {
            return null;
          }
          ref = ref[name];
      }
    }
    //console.log('getValue return : ' + ref)
    return ref;

}

function merge(fs, outStream, file, onDone) {
  var inStream = fs.createReadStream(file, {
    flags: "r",
    encoding: null,
    fd: null,
    mode: 666,
    bufferSize: 64*1024
  });
  inStream.on("end", onDone);
  outStream.write("\n\n");
  inStream.pipe(outStream, { end: false });
}

function toLower(inStr) {
  if(inStr !== null && typeof inStr !== "undefined")
    return inStr.toLowerCase();
  else return inStr;
}

var routeTable = [
  {route: "/risk-convention-master-classes", dest: "/#!/risk-convention#master-classes"},
  {route: "/COURSES", dest: "/#!/courses"},
  {route: "/courses", dest: "/#!/courses"},
  {route: "/foundations", dest: "/#!/courses/foundations-of-banking-risk/"},
  {route: "/foundations/", dest: "/#!/courses/foundations-of-banking-risk/"},
  {route: "/frr", dest: "/#!/courses/financial-risk-and-regulation/"},
  {route: "/frr/", dest: "/#!/courses/financial-risk-and-regulation/"},
  {route: "/FAQ-ERP", dest: "/#!/erp/frequently-asked-questions/"},
  {route: "/FAQ-ERP/", dest: "/#!/erp/frequently-asked-questions/"},
  {route: "/FAQ-FRM", dest: "/#!/frm/frequently-asked-questions/"},
  {route: "/FAQ-FRM/", dest: "/#!/frm/frequently-asked-questions/"},
  {route: "/press_room", dest: "/#!/about/press-room/"},
  {route: "/press_room/", dest: "/#!/about/press-room/"},
  {route: "/contact_us", dest: "/#!/about/contact-us/"},
  {route: "/contact_us/", dest: "/#!/about/contact-us/"},
  {route: "/terms", dest: "/#!/about/terms/"},
  {route: "/terms/", dest: "/#!/about/terms/"},
  {route: "/buy_side_risk_managers_forum", dest: "/#!/about/privacy-policy/"},
  {route: "/buy_side_risk_managers_forum/", dest: "/#!/about/privacy-policy/"},
  {route: "/privacy_policy", dest: "/#!/about/privacy-policy/"},
  {route: "/privacy_policy/", dest: "/#!/about/privacy-policy/"},
  {route: "/code_of_conduct", dest: "/#!/about/code-of-conduct/"},
  {route: "/code_of_conduct/", dest: "/#!/about/code-of-conduct/"},
  {route: "/bylaws", dest: "/#!/about/risk-manager-of-the-year/"},
  {route: "/bylaws/", dest: "/#!/about/risk-manager-of-the-year/"},
  {route: "/board_of_trustees", dest: "/#!/about/board-of-trustees/"},
  {route: "/board_of_trustees/", dest: "/#!/about/board-of-trustees/"},
  {route: "/rmoty_list", dest: "/#!/about/risk-manager-of-the-year/"},
  {route: "/rmoty_list/", dest: "/#!/about/risk-manager-of-the-year/"},
  {route: "/chapters", dest: "/#!/membership/chapters/"},
  {route: "/chapters/", dest: "/#!/membership/chapters/"},
  {route: "/careercenter", dest: "http://careers.garp.com/home/index.cfm?site_id=9349"},
  {route: "/benefits", dest: "/#!/membership/"},
  {route: "/rmc2016", dest: "http://www.cvent.com/d/vrqc8x"},
  {route: "/cpe", dest: "/#!/cpd/"},
  {route: "/cpd", dest: "/#!/cpd/"},
  {route: "/frm", dest: "/#!/frm/"},
  {route: "/frm/", dest: "/#!/frm/"},
  {route: "/erp/", dest: "/#!/erp/"},
  {route: "/erp", dest: "/#!/erp/"},
  {route: "/membership/profile.aspx", dest: "https://my.garp.org/Login"},
  {route: "/membership", dest: "/#!/membership/"},
  {route: "/risk-education", dest: "/#!/institutional/"},
  {route: "/risk-news-and-resources", dest: "/#!/risk_intelligence/"},
  {route: "/events", dest: "/#!/events/"},
  {route: "/garp", dest: "/#!/about/"},
  {route: "/erp", dest: "/#!/erp/"},
  {route: "/erp", dest: "/#!/erp/"},
  {route: "/webcast", dest: "http://www.garp.org/#!/risk_intelligence_browse/all/Webcast/all"},
  {route: "/gwbookstore", dest: "/#!/wiley_bookstore/"},
  {route: "/quicklinks.aspx", dest: "/#!/FAQ/"},
  {route: "https://www.garp.org/login.aspx", dest: "https://my.garp.org/Login"},
  {route: "/garp/board-of-trustees.aspx", dest: "/#!/board_of_trustees/"},
  {route: "/membership/chapters/global-chapter-network/professional-chapters-and-directors.aspx", dest: "/#!/chapters/"},
  {route: "/garp/contact-us.aspx", dest: "/#!/contact_us/"},
  {route: "/frm/register/register.aspx", dest: "https://my.garp.org/sfdcApp#!/public_registration/frm"},
  {route: "/erp/register/register.aspx", dest: "https://my.garp.org/sfdcApp#!/public_registration/erp"},
  {route: "/frm/exam-overview/key-deadlines.aspx", dest: "/#!/FAQ/"},
  {route: "/erp/exam-overview/key-deadlines.aspx", dest: "/#!/FAQ/erp_deadline#erp_deadline"},
  {route: "/erp/exam-overview/exam-format.aspx", dest: "/#!/erp_program_exams/"},
  {route: "/erp/exam-overview/exam-sites.aspx", dest: "/#!/exam_sites/"},
  {route: "/frm/exam-overview/exam-sites.aspx", dest: "/#!/exam_sites/"},
  {route: "/erp/study-center/recommended-study-plans.aspx", dest: "/#!/erp_study_materials/"},
  {route: "/erp/exam-overview/fees.aspx", dest: "/#!/erp_fees_payments/"},
  {route: "/frm/exam-overview/fees.aspx", dest: "/#!/frm_fees_payments/"},
  {route: "/frm/exam-overview/certification-requirements/qualifying-job-titles.aspx", dest: "/#!/frm/"},
  {route: "/erp/erp-program.aspx", dest: "/#!/erp/"},
  {route: "/erp/exam-overview.aspx", dest: "/#!/erp/"},
  {route: "/erp/exam-overview/fees.aspx", dest: "/#!/erp_fees_payment/"},
  {route: "/erp/study-center.aspx", dest: "/#!/erp_study_materials/"},
  {route: "/erp/study-center/study-materials.aspx", dest: "/#!/erp_program_exams/"},
  {route: "/events/16th-annual-risk-management-convention/event-summary-2c3043075935478683349d52cbfff2e9.aspx", dest: "/#!/events/"},
  {route: "/events/about-events.aspx", dest: "/#!/events/"},
  {route: "/events/chapter-meetings.aspx", dest: "/#!/chapters/"},
  {route: "/events/conferences.aspx", dest: "/#!/events/"},
  {route: "/frm/career-benefits.aspx", dest: "/#!/frm/"},
  {route: "/frm/certified-frm-resources.aspx", dest: "/#!/frm/"},
  {route: "/frm/certified-frm-resources/receiving-your-certificate.aspx", dest: "/#!/"},
  {route: "/frm/certified-frm-resources/verify-your-professional-experience.aspx", dest: "/#!/frm/"},
  {route: "/frm/exam-overview.aspx", dest: "/#!/frm_program_exams/"},
  {route: "/frm/exam-overview/after-registration.aspx", dest: "/#!/frm_program_exams/"},
  {route: "/frm/exam-overview/after-the-exam.aspx", dest: "/#!/frm/"},
  {route: "/frm/exam-overview/certification-requirements.aspx", dest: "/#!/frm/"},
  {route: "/frm/exam-overview/certification-requirements/qualifying-job-titles.aspx", dest: "/#!/frm_program_exams/"},
  {route: "/frm/exam-overview/exam-day-information.aspx", dest: "/#!/frm_program_exams/"},
  {route: "/frm/exam-overview/exam-format.aspx", dest: "/#!/frm_program_exams/"},
  {route: "/frm/exam-overview/exam-sites.aspx", dest: "/#!/frm_program_exams/"},
  {route: "/frm/exam-overview/exam-sites.aspx?p=2", dest: "/#!/frm_program_exams/"},
  {route: "/frm/exam-overview/fees.aspx", dest: "/#!/frm_study_materials/"},
  {route: "/frm/exam-overview/fees/payment-options.aspx", dest: "/#!/frm_fees_payment/"},
  {route: "/frm/exam-overview/fees/scholarship-program.aspx", dest: "/#!/erp_fees_payment/"},
  {route: "/frm/exam-overview/key-deadlines.aspx", dest: "/#!/frm_program_exams/"},
  {route: "/frm/exam-overview/sample-questions.aspx", dest: "/#!/frm_study_materials/"},
  {route: "/frm/exam-overview/testing-policies-and-procedures.aspx", dest: "/#!/FAQ/"},
  {route: "/frm/exam-overview/testing-policies-and-procedures/calculator-policies.aspx", dest: "/#!/frm/"},
  {route: "/frm/exam-overview/topic-areas.aspx", dest: "/#!/frm_program_exams/"},
  {route: "/frm/exam-results/exam-results.aspx", dest: "/#!/frm/"},
  {route: "/frm/exam-results/frm-past-exam-result.aspx", dest: "/#!/frm/"},
  {route: "/frm/faqs.aspx", dest: "/#!/faq/"},
  {route: "/frm/faqs/more-faqs.aspx", dest: "/#!/faq/"},
  {route: "/frm/frm-program.aspx", dest: "/#!/frm/"},
  {route: "/frm/frm-program.aspx?sctp=PPC&scvn=Baidu&scsrc=Baidu_Search&sckw=frm", dest: "/#!/frm/"},
  {route: "/frm/frm-program.aspx?sctp=PPC&scvn=Google&scsrc=Google_Search&sckw=frm", dest: "/#!/erp_study_materials/"},
  {route: "/frm/frm-program/about-the-frm-program.aspx", dest: "/#!/frm/"},
  {route: "/frm/frm-program/career-opportunities.aspx", dest: "/#!/frm/"},
  {route: "/frm/frm-program/frm-videos/study-strategies.aspx", dest: "/#!/frm_program_exams/"},
  {route: "/frm/frm-program/frm-videos/the-frm-program.aspx", dest: "/#!/frm/"},
  {route: "/frm/frm-program/meet-certified-frms.aspx", dest: "/#!/frm/"},
  {route: "/frm/frm-program/program-roadmap.aspx", dest: "/#!/frm/"},
  {route: "/frm/frm-program/top-employers.aspx", dest: "/#!/frm/"},
  {route: "/frm/proctor-registration.aspx", dest: "/#!/faq/"},
  {route: "/frm/register/register.aspx", dest: "/#!/registration/"},
  {route: "/frm/register/register.aspx?action=11", dest: "/#!/registration/"},
  {route: "/frm/register/register.aspx?action=2&option=1", dest: "/#!/registration/"},
  {route: "/frm/register/register.aspx?action=5&option=0", dest: "/#!/registration/"},
  {route: "/frm/register/register.aspx?action=6&error=13", dest: "/#!/registration/"},
  {route: "/frm/register/registerinvview.aspx?action=17", dest: "/#!/registration/"},
  {route: "/frm/register/registerinvview.aspx?action=6", dest: "/#!/registration/"},
  {route: "/frm/register/registration-closed.aspx", dest: "/#!/registration/"},
  {route: "/frm/register/ticket-frmparti-exam.aspx", dest: "/#!/registration/"},
  {route: "/frm/register/ticket-frmpartii-exam.aspx", dest: "/#!/registration/"},
  {route: "/frm/study-center.aspx", dest: "/#!/frm_study_materials/"},
  {route: "/frm/study-center/aim-statements.aspx", dest: "/#!/frm_study_materials/"},
  {route: "/frm/study-center/exam-preparation-providers.aspx", dest: "/#!/frm_study_materials/"},
  {route: "/erp/study-center/exam-preparation-providers.aspx", dest: "/#!/erp/exam-preparation-providers/"},
  {route: "/frm/study-center/practice-exams.aspx", dest: "/#!/frm_study_materials/"},
  {route: "/frm/study-center/study-guide.aspx", dest: "/#!/frm_study_materials/"},
  {route: "/frm/study-center/study-materials.aspx", dest: "/#!/frm_study_materials/"},
  {route: "/frm/study-center/study-materials/2015-frm-study-guide.aspx", dest: "/#!/frm_study_materials/"},
  {route: "/frm/study-center/study-materials/frm-candidate-guide.aspx", dest: "/#!/frm_study_materials/"},
  {route: "/frm/study-center/study-materials/frm-exam-preparation-handbook.aspx", dest: "/#!/frm_study_materials/"},
  {route: "/frm/study-center/study-materials/sample-frm-practice-exam.aspx", dest: "/#!/frm_study_materials/"},
  {route: "/garp/about-garp.aspx", dest: "/#!/about/"},
  {route: "/garp/contact-us.aspx", dest: "/#!/frm_study_materials/"},
  {route: "/home.aspx", dest: "/#!/"},
  {route: "/home/frm.aspx", dest: "/#!/frm/"},
  {route: "/login.aspx?errlogin=1&ReturnUrl=/frm/register/register.aspx", dest: "/#!/"},
  {route: "/membership/about-membership.aspx", dest: "/#!/membership/"},
  {route: "/membership/directory/member-search-results.aspx", dest: "/#!/directory/"},
  {route: "/membership/member-benefits.aspx", dest: "/#!/membership/"},
  {route: "/membership/overview/log-in.aspx?ReturnUrl=/", dest: "/#!/membership/"},
  {route: "/membership/overview/log-in.aspx?ReturnUrl=/frm/exam-results/exam-results.aspx", dest: "/#!/membership/"},
  {route: "/membership/overview/log-in.aspx?ReturnUrl=/frm/frm-program.aspx", dest: "/#!/membership/"},
  {route: "/membership/overview/log-in.aspx?ReturnUrl=/frm/register/ticket-frmparti-exam.aspx", dest: "/#!/membership/"},
  {route: "/membership/overview/log-in.aspx?ReturnUrl=/membership/overview/retrieve-password.aspx", dest: "/#!/membership/"},
  {route: "/membership/overview/log-in.aspx?ReturnUrl=/membership/profile.aspx", dest: "/#!/membership/"},
  {route: "/membership/overview/registration_new.aspx?regtype=1", dest: "/#!/membership/"},
  {route: "/membership/overview/registration_new.aspx?regtype=2", dest: "/#!/membership/"},
  {route: "/membership/overview/registration_new.aspx?regtype=2re", dest: "/#!/membership/"},
  {route: "/membership/overview/registrationstart.aspx", dest: "/#!/membership/"},
  {route: "/membership/overview/retrieve-password.aspx", dest: "/#!/membership/"},
  {route: "/quicklinks.aspx", dest: "/#!/"},
  {route: "/risk-education/about-risk-education.aspx", dest: "/#!/risk_intelligence/"},
  {route: "/risk-education/certificate-programs.aspx", dest: "/#!/institutional/"},
  {route: "/risk-education/continuing-education.aspx", dest: "/#!/cpd/"},
  {route: "/risk-education/risk-basics.aspx", dest: "/#!/risk_intelligence/"},
  {route: "/risk-news-and-resources/departments.aspx", dest: "/#!/risk_intelligence/"},
  {route: "/risk-news-and-resources/departments/news.aspx", dest: "/#!/risk_intelligence/"},
  {route: "/risk-news-and-resources/webcasts/upcoming-webcasts.aspx", dest: "/#!/risk_intelligence/"},
  {route: "/risk-news-and-resources/whitepapers/whitepapers.aspx", dest: "/#!/risk_intelligence"}
]

var Base64 = {


    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",


    encode: function(input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    },


    decode: function(input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = Base64._utf8_decode(output);

        return output;

    },

    _utf8_encode: function(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    _utf8_decode: function(utftext) {
        var string = "";
        var i = 0;
        var c1 = 0;
        var c2 = 0;
        var c = 0;

        while (i < utftext.length) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }

}


var cc = [
{code: 'ABW', country: 'Aruba', phoneCode: '297'},
{code: 'AFG', country: 'Afghanistan', phoneCode: '93'},
{code: 'AGO', country: 'Angola', phoneCode: '244'},
{code: 'AIA', country: 'Anguilla', phoneCode: '1'},
{code: 'ALA', country: 'Aland Islands', phoneCode: '358'},
{code: 'ALB', country: 'Albania', phoneCode: '355'},
{code: 'AND', country: 'Andorra', phoneCode: '376'},
{code: 'ANT', country: 'Netherlands Antilles', phoneCode: '599'},
{code: 'ARE', country: 'United Arab Emirates', phoneCode: '971'},
{code: 'ARG', country: 'Argentina', phoneCode: '54'},
{code: 'ARM', country: 'Armenia', phoneCode: '374'},
{code: 'ASM', country: 'American Samoa', phoneCode: '1'},
{code: 'ATA', country: 'Antarctica', phoneCode: '672'},
{code: 'ATF', country: 'French Southern Territories', phoneCode: '672'},
{code: 'ATG', country: 'Antigua and Barbuda', phoneCode: '1'},
{code: 'AUS', country: 'Australia', phoneCode: '61'},
{code: 'AUT', country: 'Austria', phoneCode: '43'},
{code: 'AZE', country: 'Azerbaijan', phoneCode: '994'},
{code: 'BDI', country: 'Burundi', phoneCode: '257'},
{code: 'BEL', country: 'Belgium', phoneCode: '32'},
{code: 'BEN', country: 'Benin', phoneCode: '229'},
{code: 'BES', country: 'Bonaire, Saint Eustatius and Saba', phoneCode: '599'},
{code: 'BFA', country: 'Burkina Faso', phoneCode: '226'},
{code: 'BGD', country: 'Bangladesh', phoneCode: '880'},
{code: 'BGR', country: 'Bulgaria', phoneCode: '359'},
{code: 'BHR', country: 'Bahrain', phoneCode: '973'},
{code: 'BHS', country: 'Bahamas', phoneCode: '1'},
{code: 'BIH', country: 'Bosnia and Herzegovina', phoneCode: '387'},
{code: 'BLM', country: 'Saint Barthelemy', phoneCode: '590'},
{code: 'BLR', country: 'Belarus', phoneCode: '375'},
{code: 'BLZ', country: 'Belize', phoneCode: '501'},
{code: 'BMU', country: 'Bermuda', phoneCode: '1'},
{code: 'BOL', country: 'Bolivia', phoneCode: '591'},
{code: 'BRA', country: 'Brazil', phoneCode: '55'},
{code: 'BRB', country: 'Barbados', phoneCode: '1'},
{code: 'BRN', country: 'Brunei Darussalam', phoneCode: '673'},
{code: 'BTN', country: 'Bhutan', phoneCode: '975'},
{code: 'BVT', country: 'Bouvet Island', phoneCode: '47'},
{code: 'BWA', country: 'Botswana', phoneCode: '267'},
{code: 'CAF', country: 'Central African Republic', phoneCode: '236'},
{code: 'CAN', country: 'Canada', phoneCode: '1'},
{code: 'CCK', country: 'Cocos (Keeling) Islands', phoneCode: '672'},
{code: 'CHE', country: 'Switzerland', phoneCode: '41'},
{code: 'CHL', country: 'Chile', phoneCode: '56'},
{code: 'CHN', country: 'China', phoneCode: '86'},
{code: 'CIV', country: 'Cote d\'Ivoire', phoneCode: '225'},
{code: 'CMR', country: 'Cameroon', phoneCode: '237'},
{code: 'COD', country: 'Congo, The Democratic Republic', phoneCode: '243'},
{code: 'COG', country: 'Congo, Republic of the', phoneCode: '242'},
{code: 'COK', country: 'Cook Islands', phoneCode: '682'},
{code: 'COL', country: 'Colombia', phoneCode: '57'},
{code: 'COM', country: 'Comoros', phoneCode: '269'},
{code: 'CPV', country: 'Cape Verde', phoneCode: '238'},
{code: 'CRI', country: 'Costa Rica', phoneCode: '506'},
{code: 'CUB', country: 'Cuba', phoneCode: '53'},
{code: 'CUW', country: 'Curacao', phoneCode: '599'},
{code: 'CXR', country: 'Christmas Island', phoneCode: '672'},
{code: 'CYM', country: 'Cayman Islands', phoneCode: '1'},
{code: 'CYP', country: 'Cyprus', phoneCode: '357'},
{code: 'CZE', country: 'Czech Republic', phoneCode: '420'},
{code: 'DEU', country: 'Germany', phoneCode: '49'},
{code: 'DJI', country: 'Djibouti', phoneCode: '253'},
{code: 'DMA', country: 'Dominica', phoneCode: '1'},
{code: 'DNK', country: 'Denmark', phoneCode: '45'},
{code: 'DOM', country: 'Dominican Republic', phoneCode: '1'},
{code: 'DZA', country: 'Algeria', phoneCode: '213'},
{code: 'ECU', country: 'Ecuador', phoneCode: '593'},
{code: 'EGY', country: 'Egypt', phoneCode: '20'},
{code: 'ERI', country: 'Eritrea', phoneCode: '291'},
{code: 'ESH', country: 'Western Sahara', phoneCode: '212'},
{code: 'ESP', country: 'Spain', phoneCode: '34'},
{code: 'EST', country: 'Estonia', phoneCode: '372'},
{code: 'ETH', country: 'Ethiopia', phoneCode: '251'},
{code: 'FIN', country: 'Finland', phoneCode: '358'},
{code: 'FJI', country: 'Fiji', phoneCode: '679'},
{code: 'FLK', country: 'Falkland Islands', phoneCode: '500'},
{code: 'FRA', country: 'France', phoneCode: '33'},
{code: 'FRO', country: 'Faroe Islands', phoneCode: '298'},
{code: 'FSM', country: 'Micronesia', phoneCode: '691'},
{code: 'FXX', country: 'France, Metropolitan', phoneCode: 'NULL'},
{code: 'GAB', country: 'Gabon', phoneCode: '241'},
{code: 'GBR', country: 'United Kingdom', phoneCode: '44'},
{code: 'GEO', country: 'Georgia', phoneCode: '995'},
{code: 'GGY', country: 'Guernsey', phoneCode: '44'},
{code: 'GHA', country: 'Ghana', phoneCode: '233'},
{code: 'GIB', country: 'Gibraltar', phoneCode: '350'},
{code: 'GIN', country: 'Guinea', phoneCode: '224'},
{code: 'GLP', country: 'Guadeloupe', phoneCode: '590'},
{code: 'GMB', country: 'Gambia', phoneCode: '220'},
{code: 'GNB', country: 'Guinea-Bissau', phoneCode: '245'},
{code: 'GNQ', country: 'Equatorial Guinea', phoneCode: '240'},
{code: 'GRC', country: 'Greece', phoneCode: '30'},
{code: 'GRD', country: 'Grenada', phoneCode: '1'},
{code: 'GRL', country: 'Greenland', phoneCode: '299'},
{code: 'GTM', country: 'Guatemala', phoneCode: '502'},
{code: 'GUF', country: 'French Guiana', phoneCode: '594'},
{code: 'GUM', country: 'Guam', phoneCode: '1'},
{code: 'GUY', country: 'Guyana', phoneCode: '592'},
{code: 'HKG', country: 'Hong Kong', phoneCode: '852'},
{code: 'HMD', country: 'Heard Island / Mcdonald Islands', phoneCode: '672'},
{code: 'HND', country: 'Honduras', phoneCode: '504'},
{code: 'HRV', country: 'Croatia', phoneCode: '385'},
{code: 'HTI', country: 'Haiti', phoneCode: '509'},
{code: 'HUN', country: 'Hungary', phoneCode: '36'},
{code: 'IDN', country: 'Indonesia', phoneCode: '62'},
{code: 'IMN', country: 'Isle of Man', phoneCode: '44'},
{code: 'IND', country: 'India', phoneCode: '91'},
{code: 'IOT', country: 'British Indian Ocean Territory', phoneCode: '246'},
{code: 'IRL', country: 'Ireland', phoneCode: '353'},
{code: 'IRN', country: 'Iran', phoneCode: '98'},
{code: 'IRQ', country: 'Iraq', phoneCode: '964'},
{code: 'ISL', country: 'Iceland', phoneCode: '354'},
{code: 'ISR', country: 'Israel', phoneCode: '972'},
{code: 'ITA', country: 'Italy', phoneCode: '39'},
{code: 'JAM', country: 'Jamaica', phoneCode: '1'},
{code: 'JEY', country: 'Jersey', phoneCode: '44'},
{code: 'JOR', country: 'Jordan', phoneCode: '962'},
{code: 'JPN', country: 'Japan', phoneCode: '81'},
{code: 'KAZ', country: 'Kazakhstan', phoneCode: '7'},
{code: 'KEN', country: 'Kenya', phoneCode: '254'},
{code: 'KGZ', country: 'Kyrgyzstan', phoneCode: '996'},
{code: 'KHM', country: 'Cambodia', phoneCode: '855'},
{code: 'KIR', country: 'Kiribati', phoneCode: '686'},
{code: 'KNA', country: 'Saint Kitts and Nevis', phoneCode: '1'},
{code: 'KOR', country: 'Korea, South', phoneCode: '82'},
{code: 'KOR', country: 'South Korea', phoneCode: '82'},
{code: 'KWT', country: 'Kuwait', phoneCode: '965'},
{code: 'LAO', country: 'Lao Peoples Democratic Republic', phoneCode: '856'},
{code: 'LBN', country: 'Lebanon', phoneCode: '961'},
{code: 'LBR', country: 'Liberia', phoneCode: '231'},
{code: 'LBY', country: 'Libyan Arab Jamahiriya', phoneCode: '218'},
{code: 'LCA', country: 'Saint Lucia', phoneCode: '1'},
{code: 'LIE', country: 'Liechtenstein', phoneCode: '423'},
{code: 'LKA', country: 'Sri Lanka', phoneCode: '94'},
{code: 'LSO', country: 'Lesotho', phoneCode: '266'},
{code: 'LTU', country: 'Lithuania', phoneCode: '370'},
{code: 'LUX', country: 'Luxembourg', phoneCode: '352'},
{code: 'LVA', country: 'Latvia', phoneCode: '371'},
{code: 'MAC', country: 'Macao', phoneCode: '853'},
{code: 'MAF', country: 'Saint Martin', phoneCode: '590'},
{code: 'MAR', country: 'Morocco', phoneCode: '212'},
{code: 'MCO', country: 'Monaco', phoneCode: '377'},
{code: 'MDA', country: 'Moldova', phoneCode: '373'},
{code: 'MDG', country: 'Madagascar', phoneCode: '261'},
{code: 'MDV', country: 'Maldives', phoneCode: '960'},
{code: 'MEX', country: 'Mexico', phoneCode: '52'},
{code: 'MHL', country: 'Marshall Islands', phoneCode: '692'},
{code: 'MKD', country: 'Macedonia', phoneCode: '389'},
{code: 'MLI', country: 'Mali', phoneCode: '223'},
{code: 'MLT', country: 'Malta', phoneCode: '356'},
{code: 'MMR', country: 'Myanmar', phoneCode: '95'},
{code: 'MNE', country: 'Montenegro', phoneCode: '382'},
{code: 'MNG', country: 'Mongolia', phoneCode: '976'},
{code: 'MNP', country: 'Northern Mariana Islands', phoneCode: '1'},
{code: 'MOZ', country: 'Mozambique', phoneCode: '258'},
{code: 'MRT', country: 'Mauritania', phoneCode: '222'},
{code: 'MSR', country: 'Montserrat', phoneCode: '1'},
{code: 'MTQ', country: 'Martinique', phoneCode: '596'},
{code: 'MUS', country: 'Mauritius', phoneCode: '230'},
{code: 'MWI', country: 'Malawi', phoneCode: '265'},
{code: 'MYS', country: 'Malaysia', phoneCode: '60'},
{code: 'MYT', country: 'Mayotte', phoneCode: '269'},
{code: 'NAM', country: 'Namibia', phoneCode: '264'},
{code: 'NCL', country: 'New Caledonia', phoneCode: '687'},
{code: 'NER', country: 'Niger', phoneCode: '227'},
{code: 'NFK', country: 'Norfolk Island', phoneCode: '672'},
{code: 'NGA', country: 'Nigeria', phoneCode: '234'},
{code: 'NIC', country: 'Nicaragua', phoneCode: '505'},
{code: 'NIU', country: 'Niue', phoneCode: '683'},
{code: 'NLD', country: 'Netherlands', phoneCode: '31'},
{code: 'NOR', country: 'Norway', phoneCode: '47'},
{code: 'NPL', country: 'Nepal', phoneCode: '977'},
{code: 'NRU', country: 'Nauru', phoneCode: '674'},
{code: 'NZL', country: 'New Zealand', phoneCode: '64'},
{code: 'OMN', country: 'Oman', phoneCode: '968'},
{code: 'PAK', country: 'Pakistan', phoneCode: '92'},
{code: 'PAN', country: 'Panama', phoneCode: '507'},
{code: 'PCN', country: 'Pitcairn', phoneCode: '872'},
{code: 'PER', country: 'Peru', phoneCode: '51'},
{code: 'PHL', country: 'Philippines', phoneCode: '63'},
{code: 'PLW', country: 'Palau', phoneCode: '680'},
{code: 'PNG', country: 'Papua New Guinea', phoneCode: '675'},
{code: 'POL', country: 'Poland', phoneCode: '48'},
{code: 'PRI', country: 'Puerto Rico', phoneCode: '1'},
{code: 'PRK', country: 'Korea, North', phoneCode: '850'},
{code: 'PRT', country: 'Portugal', phoneCode: '351'},
{code: 'PRY', country: 'Paraguay', phoneCode: '595'},
{code: 'PSE', country: 'Palestinian Territory, Occupied', phoneCode: '970'},
{code: 'PYF', country: 'French Polynesia', phoneCode: '689'},
{code: 'QAT', country: 'Qatar', phoneCode: '974'},
{code: 'REU', country: 'Reunion', phoneCode: '262'},
{code: 'ROU', country: 'Romania', phoneCode: '40'},
{code: 'RUS', country: 'Russian Federation', phoneCode: '7'},
{code: 'RUS', country: 'Russia', phoneCode: '7'},
{code: 'RWA', country: 'Rwanda', phoneCode: '250'},
{code: 'SAU', country: 'Saudi Arabia', phoneCode: '966'},
{code: 'SCG', country: 'Serbia & Montenegro', phoneCode: '381'},
{code: 'SDN', country: 'Sudan', phoneCode: '249'},
{code: 'SEN', country: 'Senegal', phoneCode: '221'},
{code: 'SGP', country: 'Singapore', phoneCode: '65'},
{code: 'SGS', country: 'South Georgia / Sandwich Islands', phoneCode: '500'},
{code: 'SHN', country: 'St. Helena', phoneCode: '290'},
{code: 'SJM', country: 'Svalbard and Jan Mayen', phoneCode: '47'},
{code: 'SLB', country: 'Solomon Islands', phoneCode: '667'},
{code: 'SLE', country: 'Sierra Leone', phoneCode: '232'},
{code: 'SLV', country: 'El Salvador', phoneCode: '503'},
{code: 'SMR', country: 'San Marino', phoneCode: '378'},
{code: 'SOM', country: 'Somalia', phoneCode: '252'},
{code: 'SPM', country: 'St. Pierre and Miquelon', phoneCode: '508'},
{code: 'SRB', country: 'Serbia', phoneCode: '381'},
{code: 'SSD', country: 'South Sudan', phoneCode: '211'},
{code: 'STP', country: 'Sao Tome and Principe', phoneCode: '239'},
{code: 'SUR', country: 'Suriname', phoneCode: '597'},
{code: 'SVK', country: 'Slovakia', phoneCode: '421'},
{code: 'SVN', country: 'Slovenia', phoneCode: '386'},
{code: 'SWE', country: 'Sweden', phoneCode: '46'},
{code: 'SWZ', country: 'Swaziland', phoneCode: '268'},
{code: 'SXM', country: 'Sint Maarten', phoneCode: '721'},
{code: 'SYC', country: 'Seychelles', phoneCode: '248'},
{code: 'SYR', country: 'Syrian Arab Republic', phoneCode: '963'},
{code: 'TCA', country: 'Turks and Caicos Islands', phoneCode: '1'},
{code: 'TCD', country: 'Chad', phoneCode: '235'},
{code: 'TGO', country: 'Togo', phoneCode: '228'},
{code: 'THA', country: 'Thailand', phoneCode: '66'},
{code: 'TJK', country: 'Tajikistan', phoneCode: '992'},
{code: 'TKL', country: 'Tokelau', phoneCode: '690'},
{code: 'TKM', country: 'Turkmenistan', phoneCode: '993'},
{code: 'TLS', country: 'Timor-Leste', phoneCode: '670'},
{code: 'TON', country: 'Tonga', phoneCode: '676'},
{code: 'TTO', country: 'Trinidad and Tobago', phoneCode: '1'},
{code: 'TUN', country: 'Tunisia', phoneCode: '216'},
{code: 'TUR', country: 'Turkey', phoneCode: '90'},
{code: 'TUV', country: 'Tuvalu', phoneCode: '688'},
{code: 'TWN', country: 'Taiwan', phoneCode: '886'},
{code: 'TZA', country: 'Tanzania', phoneCode: '255'},
{code: 'UGA', country: 'Uganda', phoneCode: '256'},
{code: 'UKR', country: 'Ukraine', phoneCode: '380'},
{code: 'UMI', country: 'US Minor Outlying Islands', phoneCode: '1'},
{code: 'URY', country: 'Uruguay', phoneCode: '598'},
{code: 'USA', country: 'United States', phoneCode: '1'},
{code: 'UZB', country: 'Uzbekistan', phoneCode: '998'},
{code: 'VAT', country: 'Vatican City State', phoneCode: '39'},
{code: 'VCT', country: 'St. Vincent and Grenadines', phoneCode: '1'},
{code: 'VEN', country: 'Venezuela', phoneCode: '58'},
{code: 'VGB', country: 'Virgin Islands, British', phoneCode: '1'},
{code: 'VIR', country: 'Virgin Islands, US', phoneCode: '1'},
{code: 'VNM', country: 'Viet Nam', phoneCode: '84'},
{code: 'VUT', country: 'Vanuatu', phoneCode: '678'},
{code: 'WLF', country: 'Wallis and Futuna Islands', phoneCode: '681'},
{code: 'WSM', country: 'Samoa', phoneCode: '685'},
{code: 'YEM', country: 'Yemen', phoneCode: '967'},
{code: 'ZAF', country: 'South Africa', phoneCode: '27'},
{code: 'ZAR', country: 'Zaire', phoneCode: '243'},
{code: 'ZMB', country: 'Zambia', phoneCode: '260'},
{code: 'ZWE', country: 'Zimbabwe', phoneCode: '263'}
]

module.exports.cc = cc;
module.exports.defined = defined;
module.exports.toLower = toLower;
module.exports.merge = merge;
module.exports.routeTable = routeTable;
module.exports.Base64 = Base64;
module.exports.getValue = getValue;
