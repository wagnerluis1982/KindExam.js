{

class Exam {
    static get FIX() { return Symbol.for('FIX') }

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
            const $container = $('<dl class="kind-exam-section"></dl>');

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
                        .wrap('<dd class="kind-exam-description"></dd>');
                }

                // Add answer choices
                if (entry.answers) {
                    const $answersList = $('<ol type="a"></ol>');
                    $('<dd class="kind-exam-answer"></dd>').appendTo($container)
                        .append($answersList);

                    entry.answers.forEach(function (answer, i) {
                        const option = makeOption(exam, qnum, i, $answersList);
                        if (typeof answer === 'string') {
                            option.text(answer);
                        } else {
                            option.html(answer);
                        }
                    });

                    // Add a "I don't know" answer choice
                    if (exam.config.understanding) {
                        makeOption(exam, qnum, entry.answers.length, $answersList)
                            .addClass('kind-exam-idontknow')
                            .html(exam.config.understanding);
                    }
                }

                // or a text input
                else {
                    const $inputAnswer = $('<dd class="kind-exam-answer" contenteditable></dd>').appendTo($container);

                    let lineBreakRepr = '<br>';

                    // check for input settings
                    if (entry.input) {
                        if (entry.input.code) {
                            lineBreakRepr = '';
                            $inputAnswer
                                .attr('spellcheck', false)
                                .css('white-space', 'pre');

                            if (typeof entry.input.code === 'string')
                                $inputAnswer.text(entry.input.code);

                            else if (entry.input.code === Exam.FIX)
                                $inputAnswer.text(entry.snippet.code);
                        }
                    }

                    // fill the input value on array
                    const fillInput = function () {
                        exam.inputs[qnum] = this.innerText.replace(/[\r\n]/g, lineBreakRepr);
                    };
                    $inputAnswer.blur(fillInput);

                    // Add a "I don't know" answer choice
                    if (exam.config.understanding) {
                        $(`<input type="checkbox"> ${exam.config.understanding}</input>`).appendTo($container)
                            .click(function () {
                                $inputAnswer.attr('contenteditable', function (_, attr) {
                                    if (attr === '' || attr === 'true') {
                                        exam.inputs[qnum] = exam.config.understanding;
                                        return false;
                                    }
                                    else {
                                        fillInput.call(this);
                                        return true;
                                    }
                                });
                            });
                    }
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

function makeOption(exam, questionIdx, answerIdx, $answerContainer) {
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
