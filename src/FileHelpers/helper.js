import Parser from 'html-react-parser';


const PRIORITY_LEVEL_LIST = ["LOW", "MODERATE", "HIGH"];
const ESCALATION_LEVEL_LIST = [1, 2, 3];

const URL_API = 'http://assignment2.dev';

const convertHTMLTag = (string) => {
    return Parser(string);
};

export {URL_API, convertHTMLTag, PRIORITY_LEVEL_LIST, ESCALATION_LEVEL_LIST};