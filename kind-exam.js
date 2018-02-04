class Exam {
    constructor(selector) {
        this.$mainContainer = $(selector).addClass('exam-questions');

        this.sections = {};
        this.inputs = [];
        this.feedbackConfig = {};
    }

    section(name, questions) {
        this.sections[name] = Object.freeze(questions);
        for (let i in questions) {
            this.inputs.push(null);
        }
    }

    setupFeedback(config) {
        if (!config) {
            throw "Invalid config passed";
        }

        const fbConfig = this.feedbackConfig;
        fbConfig.button = config.button || fbConfig.button;
        fbConfig.warning = config.warning || fbConfig.warning;
        fbConfig.filename = config.filename || fbConfig.filename;
    }

    render() {
        const exam = this;
        let questionNumber = 0;

        for (let name in exam.sections) {
            const questions = exam.sections[name];
            const $container = $('<dl></dl>');

            exam.$mainContainer
                .append(`<h2>${name}</h2>`)
                .append($container);

            questions.forEach(function (entry) {
                const qnum = questionNumber++;

                $(`<dt id="_${qnum}_">${entry.q}</dt>`).appendTo($container);

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
                        .append(`<input type="radio" id="_${qnum}-${i}_" name="_${qnum}_"> `)
                        .click(function () {
                            document.getElementById(`_${qnum}-${i}_`).checked = true;
                            exam.inputs[qnum] = String.fromCharCode(i + 65);
                        })
                        .append(`<label for="_${qnum}-${i}_"></label>`).find('label')
                        .append(document.createTextNode(answer));
                });
            });
        }

        const fbConfig = exam.feedbackConfig;
        const buttonText  = fbConfig.button   || 'Finish the exam';
        const warningText = fbConfig.warning  || 'The question {} was not answered!';
        const filename    = fbConfig.filename || 'answers.csv';

        $('<button></button>').appendTo(exam.$mainContainer)
            .css('cursor', 'pointer')
            .text(buttonText)
            .click(function () {
                const qnum = exam.inputs.indexOf(null);

                if (qnum !== -1) {
                    document.getElementById(`_${qnum}_`).scrollIntoView();
                    location.hash = `#_${qnum}_`;
                    alert(warningText.replace('{}', qnum + 1));
                    return false;
                }

                const link = document.createElement('a');
                link.href = "data:text/csv," + encodeURI(exam.inputs.join('\n'));
                link.download = filename;
                link.style.display = 'none';

                document.body.appendChild(link);
                link.click();
            });
    }
}

// Set a counter to show the question numbers
(function () {
    const css = document.styleSheets[document.styleSheets.length - 1];
    css.insertRule('.exam-questions { counter-reset: exam-counter; }');
    css.insertRule('.exam-questions dt:before { content: counter(exam-counter); counter-increment: exam-counter; }');
})();
