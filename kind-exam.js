{

class Exam {
    constructor(selector, userConfig) {
        this.$mainContainer = $(selector).addClass('kind-exam');

        this.sections = {};
        this.inputs = [];
        this.config = {};

        if (userConfig) {
            if (userConfig.feedback) {
                const defaults = {
                    button  : 'Finish the exam',
                    warning : 'The question {} was not answered!',
                    filename: 'answers.csv'
                };

                this.config.feedback = Object.assign(defaults, userConfig.feedback);
            }

            if (userConfig.understanding) {
                this.config.understanding = typeof userConfig.understanding === "string"
                    ? userConfig.understanding
                    : "I don't know";
            }
        }
    }

    section(name, questions) {
        this.sections[name] = Object.freeze(questions);
    }

    finale() {
        const exam = this;

        for (let name in exam.sections) {
            const questions = exam.sections[name];
            const $container = $('<dl></dl>');

            exam.$mainContainer
                .append(`<h2>${name}</h2>`)
                .append($container);

            questions.forEach(function (entry) {
                // Current question number
                const qnum = exam.inputs.length;
                exam.inputs.push(null);

                // Start a new question
                $container.append(`<dt id="${idFor(qnum)}" class="kind-exam-question">${entry.q}</dt>`);

                // Add <pre>code</pre> if needed
                if (entry.snippet !== undefined) {
                    $('<pre></pre>').appendTo($container)
                        .text(entry.snippet.code)
                        .wrap('<dd class="kind-exam-answer"></dd>');
                }

                // Add answer choices
                const $answersList = $('<ol type="a"></ol>');
                $('<dd class="kind-exam-answer"></dd>').appendTo($container)
                    .append($answersList);

                entry.answers.forEach(function (answer, i) {
                    makeOption(qnum, i, $answersList)
                        .text(answer);
                });

                // Add a "I don't know" answer choice
                if (exam.config.understanding) {
                    makeOption(qnum, entry.answers.length, $answersList)
                        .html(`<small>${exam.config.understanding}</small>`);
                }
            });
        }

        // Show feedback button if asked
        if (exam.config.feedback) {
            const feedback = exam.config.feedback;

            $('<button></button>').appendTo(exam.$mainContainer)
                .css('cursor', 'pointer')
                .text(feedback.button)
                .click(function () {
                    const qnum = exam.inputs.indexOf(null);

                    if (qnum !== -1) {
                        const id = idFor(qnum);
                        document.getElementById(id).scrollIntoView();
                        location.hash = id;
                        alert(feedback.warning.replace('{}', qnum + 1));
                        return false;
                    }

                    const link = document.createElement('a');
                    link.href = "data:text/csv," + encodeURI(exam.inputs.join('\n'));
                    link.download = feedback.filename;
                    link.style.display = 'none';

                    document.body.appendChild(link);
                    link.click();
                });
        }
    }
}

function idFor(x) {
    return `_q${x + 1}_`;
}

function makeOption(questionIdx, answerIdx, $answerContainer) {
    return $('<li class="kind-exam-choice"></li>').appendTo($answerContainer)
        .append(`<input type="radio" name="${idFor(questionIdx)}"> `)
        .click(function () {
            this.firstElementChild.checked = true;
            exam.inputs[questionIdx] = String.fromCharCode(answerIdx + 65);
        })
        .append('<span></span>')
        .find('span');
}

// Set a counter to show the question numbers
{
    const css = document.styleSheets[document.styleSheets.length - 1];
    css.insertRule('.kind-exam { counter-reset: exam-counter; }');
    css.insertRule('.kind-exam .kind-exam-question:before { content: counter(exam-counter); counter-increment: exam-counter; }');
}

// Globals
window.Exam = Exam;

}
