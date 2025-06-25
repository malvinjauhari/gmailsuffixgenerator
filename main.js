// Gmail Suffix Generator By Alvin Jauhari 

// Get references to HTML elements
const gmailInput = document.getElementById('gmailInput');
const variantCountInput = document.getElementById('variantCount');
const generateBtn = document.getElementById('generateBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadTxtBtn = document.getElementById('downloadTxtBtn'); // Get new button
const outputList = document.getElementById('output-list');
const messageBox = document.getElementById('messageBox');
const currentYearSpan = document.getElementById('currentYear');

// Set current year in the footer
currentYearSpan.textContent = new Date().getFullYear();

/**
 * Displays a temporary message box for user feedback.
 * @param {string} message The message to display.
 */
function showMessage(message) {
    messageBox.textContent = message;
    messageBox.classList.add('show');
    setTimeout(() => {
        messageBox.classList.remove('show');
    }, 1500); // Message disappears after 1.5 seconds
}

/**
 * Copies the given text to the clipboard.
 * Uses document.execCommand('copy') for better compatibility in iframes.
 * @param {string} text The text to copy.
 */
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showMessage('Berhasil disalin ke clipboard!'); // Copied to clipboard!
        } else {
            showMessage('Gagal menyalin. Silakan salin secara manual.'); // Failed to copy. Please copy manually.
        }
    } catch (err) {
        console.error('Gagal menyalin teks: ', err); // Failed to copy text:
        showMessage('Gagal menyalin. Silakan salin secara manual.'); // Failed to copy. Please copy manually.
    } finally {
        document.body.removeChild(textarea);
    }
}

/**
 * Generates a random alphanumeric string for use in suffixes.
 * @param {number} length The desired length of the string.
 * @returns {string} A random string.
 */
function generateRandomString(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

/**
 * Generates a list of unique Gmail suffix variants.
 * Gmail ignores dots in the username and anything after a '+' sign.
 * @param {string} username The original username part of the Gmail address.
 * @param {number} count The number of variants to generate.
 * @returns {string[]} An array of generated email variants.
 */
function generateGmailVariants(username, count) {
    const normalizedUsername = username.replace(/\./g, ''); // Gmail ignores dots
    const domain = '@gmail.com';
    const variants = new Set(); // Use a Set to ensure uniqueness

    // Always add the original normalized username as the first variant if not already there
    variants.add(normalizedUsername + domain);

    // Generate variants until the desired count is reached
    let attempts = 0;
    const maxAttempts = count * 5; // Prevent infinite loops for very short usernames
    while (variants.size < count && attempts < maxAttempts) {
        const type = Math.random(); // Randomly choose between dot and plus suffixes

        if (type < 0.5 && normalizedUsername.length > 2) { // Dot variations (only if username is long enough)
            // Insert dots randomly
            let tempUsername = normalizedUsername;
            // Limit dot insertions to prevent excessively long or complex usernames
            const dotInsertionCount = Math.floor(Math.random() * Math.min(3, tempUsername.length - 1)) + 1; // 1 to 3 dots
            let insertedDots = 0;
            let dotAttempt = 0;
            const maxDotAttempt = 10;
            while (insertedDots < dotInsertionCount && dotAttempt < maxDotAttempt) {
                const randomIndex = Math.floor(Math.random() * (tempUsername.length - 1)) + 1;
                // Ensure we don't place dots consecutively or at start/end if not intended
                if (tempUsername[randomIndex - 1] !== '.' && tempUsername[randomIndex] !== '.') {
                     tempUsername = tempUsername.slice(0, randomIndex) + '.' + tempUsername.slice(randomIndex);
                     insertedDots++;
                }
                dotAttempt++;
            }
            variants.add(tempUsername + domain);

            // Add a simple dot variation if username allows
            if (normalizedUsername.length > 0 && variants.size < count) { // Check count again
                variants.add(normalizedUsername + '.' + generateRandomString(3) + domain);
            }


        } else if (variants.size < count){ // Plus variations
            const randomSuffix = generateRandomString(4 + Math.floor(Math.random() * 3)); // 4-6 chars
            variants.add(normalizedUsername + '+' + randomSuffix + domain);
        }
        attempts++;
    }
    return Array.from(variants).slice(0, count); // Ensure we don't return more than 'count'
}


/**
 * Handles the generation process when the button is clicked.
 */
function handleGenerate() {
    const fullEmail = gmailInput.value.trim();
    const count = parseInt(variantCountInput.value, 10);

    // Basic validation
    if (!fullEmail) {
        showMessage('Silakan masukkan alamat Gmail.'); // Please enter a Gmail address.
        return;
    }
    if (!fullEmail.includes('@') || !fullEmail.endsWith('@gmail.com')) {
        showMessage('Silakan masukkan alamat @gmail.com yang valid.'); // Please enter a valid @gmail.com address.
        return;
    }
    // Updated validation for count to allow up to 100
    if (isNaN(count) || count < 1 || count > 100) {
        showMessage('Silakan masukkan angka antara 1 dan 100 untuk varian.'); // Please enter a number between 1 and 100 for variants.
        return;
    }

    const username = fullEmail.split('@')[0].split('+')[0]; // Get username before @ and before +

    // Generate and display variants
    const generatedEmails = generateGmailVariants(username, count);
    outputList.innerHTML = ''; // Clear previous results

    if (generatedEmails.length === 0) {
        outputList.innerHTML = '<li class="output-item"><span>Tidak ada varian yang dapat dibuat.</span></li>'; // No variants could be generated.
        return;
    }

    generatedEmails.forEach((email, index) => {
        const li = document.createElement('li');
        li.className = 'output-item';
        li.innerHTML = `
            <span>${email}</span>
            <button class="copy-btn">Salin</button>
        `; // Copy button text in Indonesian
        outputList.appendChild(li);

        // Animate fade-in and slide-up
        setTimeout(() => {
            li.classList.add('fade-in');
        }, 50 * index); // Stagger the animation for each item

        // Add event listener to the dynamically created copy button
        li.querySelector('.copy-btn').addEventListener('click', () => {
            copyToClipboard(email);
        });
    });
}

/**
 * Handles the download of generated variants as a .txt file.
 */
function handleDownloadTxt() {
    const outputItems = outputList.querySelectorAll('.output-item span');
    if (outputItems.length === 0 || outputItems[0].textContent.includes('Belum ada varian')) {
        showMessage('Tidak ada varian untuk diunduh.');
        return;
    }

    let fileContent = '';
    outputItems.forEach(item => {
        fileContent += item.textContent + '\n';
    });

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'gmail_variants.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href); // Clean up the URL object
    showMessage('File teks berhasil diunduh!');
}


/**
 * Resets the input fields and clears the output.
 */
function handleReset() {
    gmailInput.value = '';
    variantCountInput.value = '5';
    outputList.innerHTML = '<li class="output-item"><span>Belum ada varian yang dibuat. Masukkan alamat Gmail dan klik \'Buat Varian\'.</span></li>'; // No variants generated yet. Enter a Gmail address and click 'Generate'.
    showMessage('Masukan diatur ulang!'); // Inputs reset!
}

// Attach event listeners
generateBtn.addEventListener('click', handleGenerate);
resetBtn.addEventListener('click', handleReset);
downloadTxtBtn.addEventListener('click', handleDownloadTxt); // Attach event listener for download button

// Optional: Allow pressing Enter in input to trigger generate
gmailInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleGenerate();
    }
});
variantCountInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleGenerate();
    }
});
