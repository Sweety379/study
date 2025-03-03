let autoPlayTimer = null; // 全局定时器变量

function loadQuestion() {
    // 清除之前的定时器
    if(autoPlayTimer) clearTimeout(autoPlayTimer);

    fetch('/get_question')
    .then(r => r.json())
    .then(data => {
        // ...原有DOM更新代码...

        const audioPlayer = document.getElementById('audioPlayer');
        const emojiDisplay = document.getElementById('emojiDisplay');

        if (data.type === 'audio') {
            audioPlayer.style.display = 'block';
            emojiDisplay.style.display = 'none';
            audioPlayer.querySelector('source').src = data.content;

            // 先加载音频
            audioPlayer.load();

            // 3秒后自动播放
            autoPlayTimer = setTimeout(() => {
                audioPlayer.play().catch(error => {
                    console.log('自动播放被阻止，需要用户交互');
                    // 显示播放按钮提示
                    audioPlayer.controls = true;
                });
            }, 3000);
        } else {
            // Emoji题不需要处理
            audioPlayer.style.display = 'none';
            emojiDisplay.style.display = 'block';
            emojiDisplay.textContent = data.content;
        }

        renderOptions(data.options);
    });
}

// 修改后的checkAnswer函数
function checkAnswer(answer) {
    fetch('/check', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({answer: answer})
    })
    .then(r => r.json())
    .then(res => {
        if (res.correct) {
            alert('✅ 正确！');
            document.getElementById('score').textContent = 
                parseInt(document.getElementById('score').textContent) + 10;

            // 新增：先清除旧定时器
            if(autoPlayTimer) clearTimeout(autoPlayTimer);

            // 新增：立即显示新题目但不播放
            loadQuestion().then(() => { // 需要将loadQuestion改为返回Promise
                // 仅对音频题启动定时器
                const isAudio = document.getElementById('audioPlayer').style.display === 'block';
                if(isAudio) {
                    autoPlayTimer = setTimeout(() => {
                        const audioPlayer = document.getElementById('audioPlayer');
                        audioPlayer.play()
                            .then(() => console.log('自动播放成功'))
                            .catch(e => {
                                console.error('自动播放失败:', e);
                                audioPlayer.controls = true; // 显示控制条
                            });
                    }, 3000);
                }
            });
        } else {
            alert('❌ 错误，请重试！');
            loadQuestion();
        }
    });
}

// 修改后的loadQuestion函数（需改为异步）
function loadQuestion() {
    return new Promise((resolve) => { // 返回Promise
        if(autoPlayTimer) clearTimeout(autoPlayTimer);

        fetch('/get_question')
        .then(r => r.json())
        .then(data => {
            // ...原有DOM更新代码...

            const audioPlayer = document.getElementById('audioPlayer');
            if (data.type === 'audio') {
                audioPlayer.style.display = 'block';
                audioPlayer.querySelector('source').src = data.content + '?t=' + Date.now(); // 防缓存
                audioPlayer.load();
            } else {
                audioPlayer.style.display = 'none';
            }

            resolve(); // 数据加载完成后resolve
        });
    });
}