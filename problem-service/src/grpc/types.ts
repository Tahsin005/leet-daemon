export interface Testcase {
    id:     string;
    input:  string;
    output: string;
}

export interface Problem {
    id:          string;
    title:       string;
    description: string;
    difficulty:  string;
    editorial:   string;
    testcases:   Testcase[];
}

export interface GetProblemByIdRequest {
    problemId: string;
}

export interface GetProblemByIdResponse {
    problem?: Problem;
}