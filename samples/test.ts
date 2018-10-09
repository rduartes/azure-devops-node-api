import * as common from './common';
import * as nodeApi from 'azure-devops-node-api';

import * as BuildApi from 'azure-devops-node-api/BuildApi';
import * as CoreApi from 'azure-devops-node-api/CoreApi';
import * as testApi from 'azure-devops-node-api/testApi';
import * as BuildInterfaces from 'azure-devops-node-api/interfaces/BuildInterfaces';
import * as CoreInterfaces from 'azure-devops-node-api/interfaces/CoreInterfaces';
import * as TestInterfaces from 'azure-devops-node-api/interfaces/TestInterfaces';

export async function run(createdProjectId: string) {
    const projectId: string = common.getProject();
    const webApi: nodeApi.WebApi = await common.getWebApi();
    const testApiObject: testApi.ITestApi = await webApi.getTestApi();
    const coreApiObject: CoreApi.CoreApi = await webApi.getCoreApi();
    const project: CoreInterfaces.TeamProject = await coreApiObject.getProject(projectId);
    
    common.banner('Testing Samples');

    common.heading('Get test suite plans');
    const plans: TestInterfaces.TestPlan[] = await testApiObject.getPlans(projectId);
    console.log('Current Plans:', plans);

    common.heading('Get code coverage');
    const buildApiObject: BuildApi.IBuildApi = await webApi.getBuildApi();
    const defs: BuildInterfaces.DefinitionReference[] = await buildApiObject.getDefinitions(projectId);
    console.log('Code coverage for build' + defs[0].id + ':', await testApiObject.getCodeCoverageSummary(projectId, defs[0].id));

    common.heading('Create test suite plan');
    const testPlanModel: TestInterfaces.PlanUpdateModel = {area: null,
                                                      automatedTestEnvironment: null,
                                                      automatedTestSettings: null,
                                                      build: null,
                                                      buildDefinition: null,
                                                      configurationIds: null,
                                                      description: 'autogenerated, should be deleted',
                                                      endDate: null,
                                                      iteration: null,
                                                      manualTestEnvironment: null,
                                                      manualTestSettings: null,
                                                      name: 'myPlan',
                                                      owner: null,
                                                      releaseEnvironmentDefinition: null,
                                                      startDate: null,
                                                      state: null,
                                                      status: null};
    const testPlan = await testApiObject.createTestPlan(testPlanModel, createdProjectId);
    console.log('Created plan', testPlan.name);

    common.heading('Create test suite');
    const suiteId = 1;
    const testSuiteModel: TestInterfaces.SuiteCreateModel = {name: 'myTestSuite', queryString: 'myTestSuite', requirementIds: [], suiteType: 'StaticTestSuite'};
    const testSuite: TestInterfaces.TestSuite[] = await testApiObject.createTestSuite(testSuiteModel, createdProjectId, testPlan.id, suiteId);
    console.log('Empty suite created, should be null:', testSuite);

    common.heading('Create test variable');
    const variableToCreate: TestInterfaces.TestVariable = {description: 'variable for testing',
                                                           id: null,
                                                           name: 'testVar',
                                                           project: null,
                                                           revision: null,
                                                           url: null,
                                                           values: ['values', 'that', 'are', 'allowed']};
    const testVariable: TestInterfaces.TestVariable = await testApiObject.createTestVariable(variableToCreate, createdProjectId);
    console.log('Variable created:', testVariable);

    common.heading('Delete test variable');
    await testApiObject.deleteTestVariable(createdProjectId, testVariable.id);
    console.log('Trying to get test variable now returns', await testApiObject.getTestVariableById(createdProjectId, testVariable.id));

    common.heading('Delete test suite');
    await testApiObject.deleteTestSuite(createdProjectId, testPlan.id, suiteId);
    console.log('Trying to get suite now returns', await testApiObject.getTestSuiteById(createdProjectId, testPlan.id, suiteId));

    common.heading('Delete test suite plan');
    await testApiObject.deleteTestPlan(project.id, testPlan.id);
    console.log('Trying to get plan now returns', await testApiObject.getPlanById(createdProjectId, testPlan.id));
}