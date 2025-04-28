document.addEventListener("DOMContentLoaded", function() {
  const API_KEY_FACTCHECK = 'AIzaSyAnqtM6KzOCT2a8E9qyXCfVEumpF1ALAUU';  
  const API_KEY_NEWDATA = 'pub_807679717e758effd1e413cfd122621021702';  

  const searchButton = document.getElementById("searchBtn");
  const queryInput = document.getElementById("query"); 

  if (searchButton && queryInput) { 
    searchButton.addEventListener("click", async function() {
      const query = queryInput.value.trim(); 
      const resultsContainer = document.getElementById("results");
      resultsContainer.innerHTML = '';

      if (!query) {
        alert("Digite um nome ou frase para pesquisa!");
        return;
      }

      const columnsDiv = document.createElement('div');
      columnsDiv.className = 'columns';
      const falseNewsColumn = document.createElement('div');
      falseNewsColumn.id = 'false-news-column';
      const trueNewsColumn = document.createElement('div');
      trueNewsColumn.id = 'true-news-column';
      columnsDiv.appendChild(falseNewsColumn);
      columnsDiv.appendChild(trueNewsColumn);
      resultsContainer.appendChild(columnsDiv);

      const [factCheckResults, newsResults] = await Promise.all([
        fetchFactCheck(query),
        fetchNews(query)
      ]);
      displayFactCheckResults(factCheckResults);
      displayNewsResults(newsResults);
    });
  } else {
    console.error("Elemento de pesquisa ou botão não encontrado");
  }

  async function fetchFactCheck(query) {
    const url = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(query)}&key=${API_KEY_FACTCHECK}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.claims ? data.claims.slice(0, 5) : [];
    } catch (error) {
      console.error("Erro ao buscar informações de verificação:", error);
      return [];
    }
  }

  async function fetchNews(query) {
    const url = `https://newsdata.io/api/1/news?apikey=${API_KEY_NEWDATA}&q=${encodeURIComponent(query)}&country=br`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === 'success' && data.results && data.results.length > 0) {
        return data.results.slice(0, 5); 
      } else {
        console.error("Erro na resposta da NewsData:", data);
        return [];
      }
    } catch (error) {
      console.error("Erro ao buscar notícias:", error);
      return [];
    }
  }

  function displayFactCheckResults(factChecks) {
    const falseNewsColumn = document.getElementById('false-news-column');
    const title = document.createElement('h2');
    title.textContent = 'Notícias Falsas';
    falseNewsColumn.appendChild(title);
    if (factChecks.length > 0) {
      factChecks.forEach(claim => {
        const claimReview = claim.claimReview?.[0];
        const reviewDate = claimReview?.reviewDate
            ? new Date(claimReview.reviewDate).toLocaleString('pt-BR')
            : 'Data não disponível';
        const textualRating = claimReview?.textualRating || 'Sem veredito';
        const verdict = textualRating.toLowerCase().includes('false') ? 'FALSO' :
                        textualRating.toLowerCase().includes('true') ? 'VERDADEIRO' :
                        textualRating;
        const factCheckItem = document.createElement('div');
        factCheckItem.className = 'result false-news';
        factCheckItem.innerHTML = `
          <div class="content">
            <h3>${claim.text}</h3>
            <p><strong>Fonte:</strong> ${claim.claimant || 'Desconhecido'}</p>
            <p><strong>Status:</strong> <span style="color:${verdict === 'FALSO' ? 'red' : 'green'}">${verdict}</span></p>
            <p><strong>Data da verificação:</strong> ${reviewDate}</p>
            <div class="meta">
              <a href="${claimReview?.url}" target="_blank">Verificar fonte</a>
            </div>
          </div>
        `;
        falseNewsColumn.appendChild(factCheckItem);
      });
    } else {
      const noFactCheck = document.createElement('p');
      noFactCheck.textContent = 'Nenhuma verificação de fato encontrada.';
      falseNewsColumn.appendChild(noFactCheck);
    }
  }

  function displayNewsResults(news) {
    const trueNewsColumn = document.getElementById('true-news-column');
    const title = document.createElement('h2');
    title.textContent = 'Notícias Verídicas';
    trueNewsColumn.appendChild(title);
    if (news.length > 0) {
      news.forEach(article => {
        const newsItem = document.createElement('div');
        newsItem.className = 'result true-news';
        const firstParagraph = article.content ? article.content.split('\n')[0] : 'Sem descrição disponível';
        newsItem.innerHTML = `
          <div class="content">
            <h3>${article.title}</h3>
            <p>${firstParagraph}</p>
            <div class="meta">
              <a href="${article.link}" target="_blank">Leia mais</a>
            </div>
          </div>
        `;
        trueNewsColumn.appendChild(newsItem);
      });
    } else {
      const noNews = document.createElement('p');
      noNews.textContent = 'Nenhuma notícia encontrada.';
      trueNewsColumn.appendChild(noNews);
    }
  }
});