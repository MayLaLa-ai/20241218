class QuizSystem {
    constructor() {
        this.questions = [];
        this.currentQuestion = 0;
        this.score = 0;
        this.pointsPerQuestion = 20; // 每題 20 分
        this.userAnswers = [];
        this.init();
    }

    async init() {
        try {
            await this.loadQuestions();
            document.getElementById('loading').style.display = 'none';
            document.getElementById('quiz-container').style.display = 'block';
            this.showQuestion();
        } catch (error) {
            console.error('初始化錯誤：', error);
            document.getElementById('loading').textContent = '載入題目失敗，請重新整理頁面';
        }
    }

    async loadQuestions() {
        try {
            const response = await fetch('questions.xlsx');
            const data = await response.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            
            this.questions = jsonData.map(row => ({
                question: row.question,
                options: [row.option1, row.option2, row.option3, row.option4],
                correctAnswer: parseInt(row.correctAnswer)
            }));
        } catch (error) {
            console.error('讀取Excel檔案錯誤：', error);
            throw error;
        }
    }

    showQuestion() {
        if (this.currentQuestion >= this.questions.length) {
            this.showResult();
            return;
        }

        const question = this.questions[this.currentQuestion];
        
        // 更新進度條
        const progress = document.getElementById('progress');
        const progressPercentage = (this.currentQuestion / this.questions.length) * 100;
        progress.style.width = `${progressPercentage}%`;

        // 更新題號
        document.getElementById('question-number').textContent = 
            `題目 ${this.currentQuestion + 1} / ${this.questions.length}`;

        // 顯示題目
        document.getElementById('question-container').innerHTML = 
            `<h3>${question.question}</h3>`;

        // 顯示選項
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        question.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            optionDiv.dataset.value = index + 1;
            optionDiv.innerHTML = `${String.fromCharCode(65 + index)}. ${option}`;
            optionDiv.onclick = () => this.selectOption(optionDiv);
            optionsContainer.appendChild(optionDiv);
        });
    }

    selectOption(selectedOption) {
        document.querySelectorAll('.option').forEach(option => {
            option.classList.remove('selected');
        });
        selectedOption.classList.add('selected');
    }

    submitAnswer() {
        const selectedOption = document.querySelector('.option.selected');
        if (!selectedOption) {
            alert('請選擇一個答案！');
            return;
        }

        const userAnswer = parseInt(selectedOption.dataset.value);
        const correctAnswer = this.questions[this.currentQuestion].correctAnswer;
        
        this.userAnswers.push(userAnswer);
        
        if (userAnswer === correctAnswer) {
            this.score += this.pointsPerQuestion;
        }

        this.currentQuestion++;
        this.showQuestion();
    }

    showResult() {
        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('result-container').style.display = 'block';
        
        let comment = '';
        if (this.score === 100) {
            comment = '<div class="perfect-score">太棒了！完美的表現！ 🎉</div>';
        } else if (this.score >= 80) {
            comment = '<div class="good-score">表現優良！繼續保持！ 👍</div>';
        } else if (this.score >= 60) {
            comment = '<div class="pass-score">不錯唷！還可以更好！ 💪</div>';
        } else {
            comment = '<div class="low-score">再加油！下次一定會更好！ 📚</div>';
        }

        document.getElementById('score').innerHTML = `
            <div class="score-number">總分：${this.score} 分</div>
            ${comment}
        `;

        const reviewContainer = document.getElementById('review-container');
        reviewContainer.innerHTML = '<h3>答題回顧</h3>';
        
        this.questions.forEach((question, index) => {
            const userAnswer = this.userAnswers[index];
            const correctAnswer = question.correctAnswer;
            const isCorrect = userAnswer === correctAnswer;
            
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';
            reviewItem.innerHTML = `
                <div>第 ${index + 1} 題：${question.question}</div>
                <div class="${isCorrect ? 'correct' : 'incorrect'}">
                    ${isCorrect ? `✓ 答對（+${this.pointsPerQuestion}分）` : '✗ 答錯（+0分）'}
                    ${!isCorrect ? `（正確答案：${String.fromCharCode(64 + correctAnswer)}）` : ''}
                </div>
            `;
            reviewContainer.appendChild(reviewItem);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const quiz = new QuizSystem();
    document.getElementById('submit-btn').addEventListener('click', () => quiz.submitAnswer());
}); 