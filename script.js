const apiKey = "  your api key";
let documentText = "";

// Event listener for file upload
document.getElementById("file").addEventListener("change", handleFileUpload);

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  document.getElementById("loading").style.display = "block";
  const reader = new FileReader();
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".txt")) {
    reader.onload = () => {
      documentText = reader.result;
      hideLoadingAndAlert("Text file loaded!");
    };
    reader.readAsText(file);
  }

  else if (fileName.endsWith(".pdf")) {
    const pdfReader = new FileReader();
    pdfReader.onload = function () {
      const typedArray = new Uint8Array(this.result);
      pdfjsLib.getDocument(typedArray).promise.then(pdf => {
        let textContent = "";
        let pages = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          pages.push(
            pdf.getPage(i).then(page =>
              page.getTextContent().then(text => {
                textContent += text.items.map(item => item.str).join(" ") + "\n";
              })
            )
          );
        }

        Promise.all(pages).then(() => {
          documentText = textContent;
          hideLoadingAndAlert("PDF loaded!");
        }).catch(err => {
          hideLoadingAndAlert("❌ Failed to parse PDF");
          console.error("PDF parse error:", err);
        });

      }).catch(err => {
        hideLoadingAndAlert("❌ Failed to load PDF");
        console.error("PDF load error:", err);
      });

    };
    pdfReader.readAsArrayBuffer(file);
  }

  else if (fileName.endsWith(".docx")) {
    reader.onload = () => {
      mammoth.extractRawText({ arrayBuffer: reader.result })
        .then(result => {
          documentText = result.value;
          hideLoadingAndAlert("DOCX loaded!");
        });
    };
    reader.readAsArrayBuffer(file);
  }

  else if (fileName.endsWith(".xlsx") || fileName.endsWith(".csv")) {
    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      let text = "";
      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        rows.forEach(row => {
          text += row.join(" ") + "\n";
        });
      });

      documentText = text;
      hideLoadingAndAlert("Excel file loaded!");
    };
    reader.readAsArrayBuffer(file);
  }

  else {
    hideLoadingAndAlert("Unsupported file type.");
  }
}

function hideLoadingAndAlert(message) {
  document.getElementById("loading").style.display = "none";
  alert(message);
}

// Handle user input and response
async function handleUserMessage() {
  const input = document.getElementById('userInput');
  const chatBox = document.getElementById('chat');
  const message = input.value.trim();

  if (!message) return;

  // Show user message
  const userMsg = document.createElement('div');
  userMsg.textContent = `🧑 You: ${message}`;
  chatBox.appendChild(userMsg);

  // Show thinking
  const botMsg = document.createElement('div');
  botMsg.textContent = `🤖 Bot: Thinking...`;
  chatBox.appendChild(botMsg);
  input.value = '';
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant. Answer based on the provided document." },
          { role: "user", content: `Document:\n${documentText}\n\nQuestion:\n${message}` }
        ],
        max_tokens: 300
      })
    });

    const data = await response.json();
    console.log("OpenAI API response:", data); // Debug line

    if (data.error) {
      console.error("OpenAI API Error:", data.error);
      botMsg.textContent = `❌ OpenAI error: ${data.error.message}`;
      return;
    }

    const reply = data.choices?.[0]?.message?.content || "❌ No valid response.";
    botMsg.textContent = `🤖 Bot: ${reply}`;
  } catch (error) {
    botMsg.textContent = "❌ Error contacting OpenAI.";
    console.error("Fetch error:", error);
  }

  chatBox.scrollTop = chatBox.scrollHeight;
}
