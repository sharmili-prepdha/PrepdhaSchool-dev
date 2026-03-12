# Question Cards Feature

This feature handles MCQ question creation (CMS side) and quiz rendering (user side).

## Pages

### /mcq/create - access to Role.superadmin

Used by CMS/admin to create MCQ questions.

Responsibilities:

* Create new MCQ/MSQ/TF questions
* Add options
* Define correct answer
* Save questions to database
* Resume and Start Fresh Opt

### /mcq - access to Role.student

User-facing quiz page.

Responsibilities:

* Display questions topic-wise with question and option shuffling mechanism
* Allow users to attempt MCQs
* Handle answer selection
* Show result or progress
* Resume and Start Fresh Opt
* Save accuracy on every quiz completion

### /mcq/temp

For testing tip-tap editor i.e. 

./components
    └──editor/

## Components, SA, Libs, Seed.ts & Utils Used
    
    PrepdhaInterns/
    └── features/
        └── question-cards/
            ├───actions/
            ├───components/
            │   ├───editor/
            │   ├───question/
            │   │   ├───dump/
            │   │   ├───hooks/
            │   │   └───utils/
            │   └───question-builder/
            │       └───modals/
            ├───lib/
            └───types/
            └───seed.ts