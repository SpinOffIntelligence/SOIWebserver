describe('garp frm homepage', function() {
  describe('garp frm register page', function(){
    beforeEach(function(){
      browser.get('http://localhost:3000/#!/frm/register');
    });
    it ('should not be able to click next button on first page without valid input', function() {
      var firstName, lastName, submitButton, nextButton, nextButton2;
      firstName = element(by.css('[name="firstName"]'));
      lastName = element(by.css('[name="lastName"]'));
      nextButton = element(by.css('.register-next-a-first'))
      firstName.clear();
      lastName.clear();
      firstName.sendKeys('Khalid');
      lastName.sendKeys('Garner');
      expect(nextButton.getAttribute('disabled')).toBeTruthy();
    });
    it ('should be able to click the next button on first page with valid input', function(){
      var firstName, lastName, submitButton, nextButton, nextButton2, email, pass1, pass2;
      firstName = element(by.css('[name="firstName"]'));
      lastName = element(by.css('[name="lastName"]'));
      email = element(by.css('[name="email"]'));
      pass1 = element(by.css('[name="pass"]'));
      pass2 = element(by.css('[name="pass2"]'));
      nextButton = element(by.css('.register-next-a-first'))
      firstName.clear();
      lastName.clear();
      email.clear();
      pass1.clear();
      pass2.clear();
      firstName.sendKeys('Khalid');
      lastName.sendKeys('Garner');
      email.sendKeys('test@case.com');
      pass1.sendKeys('khalid');
      pass2.sendKeys('khalid');
      expect(nextButton.getAttribute('disabled')).toBeFalsy();
    });
  });
});

