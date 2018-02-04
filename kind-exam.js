class Exam {
    constructor(selector, userConfig) {
        this.$mainContainer = $(selector).addClass('exam-questions');

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
        }
    }

    section(name, questions) {
        this.sections[name] = Object.freeze(questions);
    }

    render() {
        const exam = this;

        for (let name in exam.sections) {
            const questions = exam.sections[name];
            const $container = $('<dl></dl>');

            exam.$mainContainer
                .append(`<h2>${name}</h2>`)
                .append($container);

            questions.forEach(function (entry) {
                const qnum = exam.inputs.length;
                exam.inputs.push(null);

                $container.append(`<dt id="_${qnum}_">${entry.q}</dt>`);

                if (entry.snippet !== undefined) {
                    $('<pre></pre>').appendTo($container)
                        .text(entry.snippet.code)
                        .wrap('<dd></dd>');
                }

                const $answersList = $('<ol type="a"></ol>');
                $('<dd></dd>').appendTo($container)
                    .append($answersList);

                entry.answers.forEach(function (answer, i) {
                    $('<li></li>').appendTo($answersList)
                        .append(`<input type="radio" name="_${qnum}_"> `)
                        .click(function () {
                            this.firstElementChild.checked = true;
                            exam.inputs[qnum] = String.fromCharCode(i + 65);
                        })
                        .append('<span></span>')
                        .find('span')
                        .append(document.createTextNode(answer));
                });
            });
        }

        if (exam.config.feedback) {
            const feedback = exam.config.feedback;

            $('<button></button>').appendTo(exam.$mainContainer)
                .css('cursor', 'pointer')
                .text(feedback.button)
                .click(function () {
                    const qnum = exam.inputs.indexOf(null);

                    if (qnum !== -1) {
                        document.getElementById(`_${qnum}_`).scrollIntoView();
                        location.hash = `#_${qnum}_`;
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

// Set a counter to show the question numbers
(function () {
    const css = document.styleSheets[document.styleSheets.length - 1];
    css.insertRule('.exam-questions { counter-reset: exam-counter; }');
    css.insertRule('.exam-questions dt:before { content: counter(exam-counter); counter-increment: exam-counter; }');
})();
