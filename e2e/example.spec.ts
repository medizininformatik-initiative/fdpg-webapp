import type { Page} from '@playwright/test';
import {test, expect} from '@playwright/test';

test('create, submit and forward a project', async ({page}) => {
  const baseUrl: string = process.env.URL;
  const usernameResearcher: string = process.env.USERNAME_RESEARCHER;
  const usernameEmployee: string = process.env.USERNAME_EMPLOYEE;
  const passwordResearcher: string = process.env.PASSWORD_RESEARCHER;
  const passwordEmployee: string = process.env.PASSWORD_EMPLOYEE;

  const title = `Test-${Date.now()}`;

  await goToDashboard(page, baseUrl);
  await logIn(page, usernameResearcher, passwordResearcher);
  await createAndSubmitProject(page, baseUrl, title);
  await logOut(page);

  await logIn(page, usernameEmployee, passwordEmployee);
  await checkAndForwardProject(page, title);
  await logOut(page);
});

async function goToDashboard(page: Page, baseUrl: string) {
  await page.goto(baseUrl);
  // await page.waitForURL('/');
  await page.waitForNavigation();
}

async function saveProject(page: Page) {
  await page.getByTestId('handleSaveDraft').click();
  await checkForSuccessAlert(page);
}

async function checkForSuccessAlert(page: Page) {
  await page.waitForSelector('div[role="alert"]');
  await expect(page.getByRole('heading', {name: 'Success'})).toBeVisible();
}

async function uploadFile(page: Page, testId: string, filename: string) {
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.getByTestId(testId).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(filename);
}

async function logIn(page: Page, username: string, password: string) {
  await page.locator('#username').fill(username);
  await page.locator('#password').fill(password);
  await page.locator('#kc-login').click();
  await page.waitForNavigation();
  await page.waitForNavigation();
}

async function logOut(page: Page) {
  await page.getByTestId('header.profileButton').click();
  await page.locator('xpath=//*[@data-testid="header.profileButton"]/div/span[1]').click();
  await page.waitForNavigation();
  await page.waitForNavigation();
}

async function createAndSubmitProject(page: Page, baseUrl: string, title: string) {
  await page.getByTestId('dashboard.makeARequest').click();

  await page.getByTestId('proposalForm.projectAbbreviation').fill(title);

  await page.getByTestId('radio-option_DATA_RECEIVER__applicant').check();

  await page.getByTestId('projectResponsible.projectResponsibility.applicantIsProjectResponsible').check();

  await page.getByTestId('radio-option_ORGANIZATION_OF_PROJECT_RESPONSIBLE').check();

  await page.getByTestId('generalProjectInformationForm.projectTitle').fill(title);
  await page.getByTestId('generalProjectInformationForm.desiredStartTime').getByRole('textbox').fill('31/12/2029');
  await page.getByTestId('generalProjectInformationForm.projectDuration').getByRole('spinbutton').fill('1');
  await page.getByTestId('generalProjectInformation.projectFunding').fill('Wird finanziert von Geldgeber x');
  await page.getByTestId('generalProjectInformationForm.fundingReferenceNumber').fill('Förderkennzeichen x');
  await page.getByTestId('feasibilityForm.details').fill('Ergänzende Informationen zur Machbarkeitsuntersuchung.');

  await page.getByTestId('projectDetailsForm.simpleProjectDescription').fill('Projektbeschreibung');
  await page.getByTestId('projectDetailsForm.department').click();
  await page.getByTestId('option__0100__projectDetailsForm.department').click();
  await page.getByTestId('projectDetailsForm.department').click();

  await page.getByTestId('projectDetailsForm.hypothesisAndQuestionProjectGoals').fill('Hypothese');
  await page.getByTestId('projectDetailsForm.scientificBackground').fill('Wissenschaftlicher Hintergrund');
  await page.getByTestId('projectDetailsForm.materialAndMethods').fill('Material und Methoden');

  await page.getByTestId('ethicVoteForm.ethicsCommittee').fill('Ethikkommission');
  await page.getByTestId('ethicVoteForm.ethicsVoteNumber').fill('Ethikvotum Nummer');
  await page.getByTestId('ethicVoteForm.voteFromDate').getByRole('textbox').fill('31/12/2029');

  await page.getByTestId('radio-option_true__resourceAndRecontactForm.hasEnoughResources').check();
  await page.getByTestId('radio-option_true__resourceAndRecontactForm.isRecontactingIntended').check();

  await page.getByTestId('propertyRightsForm.options').fill('Schutzrechte');

  // open dropdown and select option
  await page.getByTestId('publication.type__0').click();
  await page.getByTestId('option__REPORT').click();
  await page.getByTestId('publication.description__0').fill('Beschreibung');
  await page.getByTestId('publication.authors__0').fill('Autor_1, Autor_2');

  await page.getByTestId('checkbox__DISTRIBUTED').check();

  await page.getByTestId('requestedData.patientInfo').fill('Angaben zur Patientenauswahl');
  await page.getByTestId('requestedData.dataInfo').fill('Angaben zur Datenauswahl');
  await page.getByTestId('requestedData.desiredDataAmount').getByRole('spinbutton').fill('100');

  await saveProject(page);

  await goToDashboard(page, baseUrl);

  // a project card with the title should be visible
  await expect(page.getByText(title)).toBeVisible();

  // select project and go to proposal
  await page.getByText(title).click();
  await page.getByTestId('button__toProposal').click();

  // upload documents
  await uploadFile(page, 'general-appendix__upload__button', 'e2e/testDocument.pdf');
  await uploadFile(page, 'ethicVoteForm__upload__button', 'e2e/testDocument.pdf');
  await page.getByTestId('ethicVoteForm__admit__check').check();

  await saveProject(page);

  await goToDashboard(page, baseUrl);

  // a project card with the title should be visible
  await expect(page.getByText(title)).toBeVisible();

  await page.getByText(title).click();
  await page.getByTestId('button__toProposal').click();
  await page.getByTestId('handleSubmit').click();

  // await page.getByTestId('checkbox__option_0').check();
  await page.getByTestId('checkbox__option_0').locator('span').nth(1).check();
  await page.getByTestId('checkbox__option_1').locator('span').nth(1).check();

  // await page.getByTestId('checkbox__option_1').check();
  await page.getByTestId('button__confirm').click();
  await checkForSuccessAlert(page);
}

async function checkAndForwardProject(page: Page, title: string) {
  // a project card with the title should be visible
  await expect(page.getByText(title)).toBeVisible();

  await page.getByText(title).click();

  await page.getByTestId('button__toProposal').click();

  await page.getByText('Name').waitFor({state: "visible"})

  const checkboxSelections = await page.$$('.el-checkbox__input');
  for (let i = 0; i < checkboxSelections.length; i++) {
    await checkboxSelections[i].scrollIntoViewIfNeeded();
    await checkboxSelections[i].click();
  }

  await page.getByTestId('button__projectDetails').click();

  await page.getByTestId('checkbox__isRegistrationLinkSent').click();
  await page.getByTestId('checkbox__isUnique').click();
  await page.getByTestId('checkbox__isAttachmentsChecked').click();
  await page.getByTestId('checkbox__isChecked').click();

  await page.getByTestId('button__toLocationCheck').click();
  await page.getByTestId('button__confirm').click();
}
