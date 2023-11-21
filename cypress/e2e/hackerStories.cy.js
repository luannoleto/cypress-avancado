describe('Hacker Stories', () => {
  const termoInicial = 'React';
  const novoTermo = 'Cypress';

  context('Acessando a API com dados reais', () => {
    beforeEach(() => {
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: termoInicial,
          page: '0',
        },
      }).as('pegarItemInicial');

      cy.visit('/');
      cy.wait('@pegarItemInicial');
    });

    it('Deve exibir 20 histórias e depois as próximas 20 após clicar em "More"', () => {
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: termoInicial,
          page: '1',
        },
      }).as('getNextPage');

      cy.get('.item')
        .should('have.length', 20);
      cy.contains('More')
        .should('be.visible')
        .click();
      cy.wait('@getNextPage');
      cy.get('.item')
        .should('have.length', 40);
    });

    it('Deve buscar através do último termo pesquisado', () => {
      cy.intercept(
        'GET',
        `**/search?query=${novoTermo}&page=0`
      ).as('pegarNovoTermoPesquisado');

      cy.get('#search')
        .should('be.visible')
        .clear()
        .type(`${novoTermo}{enter}`);

      cy.wait('@pegarNovoTermoPesquisado'); //aguarda pela requisição acabar

      cy.getLocalStorage('search')
        .should('be.equal', novoTermo)

      cy.get(`button:contains(${termoInicial})`)
        .should('be.visible')
        .click();

      cy.wait('@pegarItemInicial'); //aguarda pela requisição acabar

      cy.getLocalStorage('search')
        .should('be.equal', termoInicial)

      cy.get('.item')
        .should('have.length', 20);
      cy.get('.item')
        .first()
        .should('be.visible')
        .and('contain', termoInicial);
      cy.get(`button:contains(${novoTermo})`)
        .should('be.visible');
    });
  });

  context('Acessando a API com dados mocados', () => {
    context('Rodapé e lista de histórias', () => {
      beforeEach(() => {
        cy.intercept(
          'GET',
          `**/search?query=${termoInicial}&page=0`,
          { fixture: 'itensDePesquisa'}
        ).as('pegarItemInicial');

        cy.visit('/');
        cy.wait('@pegarItemInicial');
      });

      it('Deve mostrar o rodapé', () => {
        cy.get('footer')
          .should('be.visible')
          .and('contain', 'Icons made by Freepik from www.flaticon.com');
      });

      context('Lista de itens', () => {
        const itens = require('../fixtures/itensDePesquisa.json');

        it('Deve mostrar os dados corretos para todas as histórias renderizadas', () => {
          cy.get('.item')
            .first()
            .should('be.visible')
            .and('contain', itens.hits[0].title)
            .and('contain', itens.hits[0].author)
            .and('contain', itens.hits[0].num_comments)
            .and('contain', itens.hits[0].points);
          cy.get(`.item a:contains(${itens.hits[0].title})`)
            .should('have.attr', 'href', itens.hits[0].url);

          cy.get('.item')
            .last()
            .should('be.visible')
            .and('contain', itens.hits[1].title)
            .and('contain', itens.hits[1].author)
            .and('contain', itens.hits[1].num_comments)
            .and('contain', itens.hits[1].points);
          cy.get(`.item a:contains(${itens.hits[1].title})`)
            .should( 'have.attr', 'href', itens.hits[1].url);
        });

        it('Deve mostrar uma história a menos depois de descartar a primeira história', () => {
          cy.get('.button-small')
            .first()
            .should('be.visible')
            .click();

          cy.get('.item')
            .should('have.length', 1);
        });

        context('Ordenar itens', () => {
          it('Deve ordernar o item por título', () => {
            cy.get('.list-header-button:contains(Title)')
              .as('ordenarTitulo')
              .should('be.visible')
              .click();

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', itens.hits[0].title);
            cy.get(`.item a:contains(${itens.hits[0].title})`)
              .should('have.attr','href', itens.hits[0].url);

            cy.get('@ordenarTitulo').click();

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', itens.hits[1].title);
            cy.get(`.item a:contains(${itens.hits[1].title})`)
            .should('have.attr','href',itens.hits[1].url);
          });

          it('Deve ordernar o item por autor', () => {
            cy.get('.list-header-button:contains(Author)')
              .as('ordenarAutor')
              .should('be.visible')
              .click();

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', itens.hits[0].author);

            cy.get('@ordenarAutor').click();

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', itens.hits[1].author);
          });

          it('Deve ordernar o item por comentário', () => {
            cy.get('.list-header-button:contains(Comments)')
              .as('ordenarComentario')
              .should('be.visible')
              .click();

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', itens.hits[0].num_comments);

            cy.get('@ordenarComentario').click();

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', itens.hits[1].num_comments);
          });

          it('Deve ordernar o item por pontos', () => {
            cy.get('.list-header-button:contains(Points)')
              .as('ordenarPontos')
              .should('be.visible')
              .click();

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', itens.hits[1].points);

            cy.get('@ordenarPontos').click();

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', itens.hits[0].points);
          });
        });
      });

      context('Pesquisa', () => {
        beforeEach(() => {
          cy.intercept(
            'GET',
            `**/search?query=${termoInicial}&page=0`,
            { fixture: 'listaDeItensVazia' }
          ).as('pegarListaDeIntensVazia'); //intercept para trazer uma lista vazia

          cy.intercept(
            'GET', 
            `**/search?query=${novoTermo}&page=0`,
            { fixture: 'itensDePesquisa' }
          ).as('pegarItens'); //intercept para trazer uma lista de itens mocados

          cy.visit('/');
          cy.wait('@pegarListaDeIntensVazia');

          cy.get('#search')
            .should('be.visible')
            .clear();
        });

        it('Nenhum item deve ser retornado', () => {
          cy.get('.item')
            .should('not.exist')
      });

        it('Deve digitar e pressionar ENTER', () => {
          cy.get('#search')
            .should('be.visible')
            .type(`${novoTermo}{enter}`);

          cy.wait('@pegarItens'); //aguarda pela requisição acabar

          cy.getLocalStorage('search') //verifica que o valor está sendo guardado no application > localStorage
            .should('be.equal', novoTermo)

          cy.get('.item').should('have.length', 2);
          cy.get(`button:contains(${termoInicial})`)
            .should('be.visible');
        });

        it('Deve digitar e clicar no botão enviar', () => {
          cy.get('#search')
            .should('be.visible')
            .type(novoTermo);
          cy.contains('Submit')
            .should('be.visible')
            .click();

          cy.wait('@pegarItens'); //aguarda pela requisição acabar

          cy.getLocalStorage('search') //verifica que o valor está sendo guardado no application > localStorage
            .should('be.equal', novoTermo)

          cy.get('.item')
            .should('have.length', 2);
          cy.get(`button:contains(${termoInicial})`)
            .should('be.visible');
        });

        context('Últimas pesquisas', () => {
          it('Deve mostrar um máximo de 5 botões para os últimos termos pesquisados', () => {
            const faker = require('faker');

            cy.intercept(
              'GET',
              '**/search**',
              { fixture: 'listaDeItensVazia'}
            ).as('pegarItensDePesquisasAleatorias');

            Cypress._.times(6, () => {
              const randomWord = faker.random.word()

              cy.get('#search')
                .clear()
                .type(`${randomWord}{enter}`);

              cy.wait('@pegarItensDePesquisasAleatorias'); //aguarda pela requisição acabar

              cy.getLocalStorage('search') //verifica que o valor está sendo guardado no application > localStorage
                .should('be.equal', randomWord)
            });

            cy.get('.last-searches')
              .within (() => {
                cy.get('button')
                  .should('have.length', 5);
              })
          });
        });
      });
    });
  });
});

context('Errors', () => {
  it('Deve mostrar "Algo errado..." em caso de erro do servidor', () => {
    cy.intercept(
      'GET',
      '**/search**', 
      { statusCode: 500 })
    .as('falhaNoServidor');

    cy.visit('/');
    cy.wait('@falhaNoServidor');

    cy.get('p:contains(Something went wrong ...)')
      .should('be.visible');
  });

  it('Deve mostrar "Algo errado..." em caso de erro de rede', () => {
    cy.intercept(
      'GET',
      '**/search**',
      { forceNetworkError: true }
    ).as('falhaNoNetwork');

    cy.visit('/');
    cy.wait('@falhaNoNetwork');

    cy.get('p:contains(Something went wrong ...)')
      .should('be.visible');
  });
});

it('Deve mostrar estado "Carregando ..." antes de mostrar os resultados', () => {
  cy.intercept(
    'GET',
    '**/search**',
    {
      delay: 1000,
      fixture: 'itensDePesquisa'
    }
  ).as('pegaDelayedItens')

  cy.visit('/')

  cy.verificarElementoLoadingExibido()
  cy.wait('@pegaDelayedItens')

  cy.get('.item').should('have.length', 2)
})