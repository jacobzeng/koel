context('Playlists', () => {
  it('displays a playlist when sidebar menu item is clicked', () => {
    cy.intercept('GET', '/api/playlist/1/songs', {
      fixture: 'playlist-songs.get.200.json'
    })

    cy.$login()

    cy.get('#sidebar')
      .findByText('Simple Playlist')
      .as('menuItem')
      .click()

    cy.get('#playlistWrapper').within(() => {
      cy.get('.heading-wrapper')
        .should('be.visible')
        .and('contain', 'Simple Playlist')

      cy.get('tr.song-item')
        .should('be.visible')
        .and('have.length', 3)

      cy.findByText('Download All').should('be.visible')
      ;['.btn-shuffle-all', '.btn-delete-playlist'].forEach(selector => cy.get(selector).should('be.visible'))
    })
  })

  it('deletes a playlist', async () => {
    cy.intercept('GET', '/api/playlist/1/songs', {
      fixture: 'playlist-songs.get.200.json'
    })

    cy.intercept('DELETE', '/api/playlist/1', {})

    cy.$login()

    cy.get('#sidebar')
      .findByText('Simple Playlist')
      .as('menuItem')
      .click()

    cy.get('#playlistWrapper .btn-delete-playlist')
      .click()
      .$confirm()

    cy.url().should('contain', '/#!/home')
    cy.get('@menuItem').should('not.exist')
  })

  it('creates a simple playlist from the sidebar', () => {
    cy.intercept('GET', '/api/playlist/2/songs', [])

    cy.intercept('POST', '/api/playlist', {
      fixture: 'playlist.post.200.json'
    })

    cy.$login()
    cy.findByTestId('sidebar-create-playlist-btn').click()
    cy.findByTestId('playlist-context-menu-create-simple').click()

    cy.get('[name=create-simple-playlist-form] [name=name]')
      .as('nameInput')
      .should('be.visible')

    cy.get('@nameInput')
      .clear()
      .type('A New Playlist{enter}')

    cy.get('#sidebar')
      .findByText('A New Playlist')
      .should('exist')
      .and('have.class', 'active')

    cy.findByText('Created playlist "A New Playlist".').should('be.visible')

    cy.get('#playlistWrapper .heading-wrapper')
      .should('be.visible')
      .and('contain', 'A New Playlist')

    cy.get('#playlistWrapper .none')
      .should('be.visible')
      .and('contain', 'The playlist is currently empty.')
  })

  it('updates a simple playlist from the sidebar', () => {
    cy.intercept('PUT', '/api/playlist/1', {})
    cy.intercept('GET', '/api/playlist/1/songs', {
      fixture: 'playlist-songs.get.200.json'
    })

    cy.get('#sidebar')
      .findByText('Simple Playlist')
      .as('menuItem')
      .dblclick()

    cy.findByTestId('inline-playlist-name-input')
      .as('nameInput')
      .should('be.focused')

    cy.get('@nameInput')
      .clear()
      .type('A New Name{enter}')

    cy.get('@menuItem')
      .should('contain', 'A New Name')
      .and('have.class', 'active')

    cy.findByText('Updated playlist "A New Name".').should('be.visible')

    cy.get('#playlistWrapper .heading-wrapper')
      .should('be.visible')
      .and('contain', 'A New Name')
  })

  it('creates a smart playlist', () => {
    cy.intercept('GET', '/api/playlist/2/songs', [])

    cy.intercept('POST', '/api/playlist', {
      fixture: 'playlist-smart.post.200.json'
    })

    cy.intercept('GET', '/api/playlist/1/songs', {
      fixture: 'playlist-songs.get.200.json'
    })

    cy.$login()
    cy.findByTestId('sidebar-create-playlist-btn').click()
    cy.findByTestId('playlist-context-menu-create-smart').click()

    cy.findByTestId('create-smart-playlist-form')
      .should('be.visible')
      .within(() => {
        cy.get('[name=name]')
          .should('be.focused')
          .type('My Smart Playlist')

        cy.get('.btn-add-group').click()

        // Add the first rule
        cy.get('.btn-add-rule').click()
        cy.get('[name="model[]"]').select('Album')
        cy.get('[name="operator[]"]').select('is not')
        cy.wait(0) // the "value" text box is rendered asynchronously
        cy.get('[name="value[]"]').type('Foo')

        // Add a second rule
        cy.get('.btn-add-rule').click()
        cy.get('[data-test=smart-playlist-rule-row]:nth-child(3) [name="model[]"]').select('Length')
        cy.get('[data-test=smart-playlist-rule-row]:nth-child(3) [name="operator[]"]').select('is greater than')
        cy.wait(0)
        cy.get('[data-test=smart-playlist-rule-row]:nth-child(3) [name="value[]"]').type('180')

        // Add another group (and rule)
        cy.get('.btn-add-group').click()
        cy.get('[data-test=smart-playlist-rule-group]:nth-child(2) .btn-add-rule').click()
        cy.wait(0)
        cy.get('[data-test=smart-playlist-rule-group]:nth-child(2) [name="value[]"]').type('Whatever')

        // Remove a rule from the first group
        cy.get(`
          [data-test=smart-playlist-rule-group]:first-child
          [data-test=smart-playlist-rule-row]:nth-child(2)
          .remove-rule
        `).click()

        cy.get('[data-test=smart-playlist-rule-group]:first-child [data-test=smart-playlist-rule-row]')
          .should('have.length', 1)

        cy.findByText('Save').click()
      })

    cy.findByText('Created playlist "My Smart Playlist".').should('be.visible')

    cy.get('#playlistWrapper').within(() => {
      cy.get('.heading-wrapper')
        .should('be.visible')
        .and('contain', 'My Smart Playlist')

      cy.get('tr.song-item')
        .should('be.visible')
        .and('have.length', 3)
    })

    cy.get('#sidebar')
      .findByText('My Smart Playlist')
      .should('have.class', 'active')
  })
})