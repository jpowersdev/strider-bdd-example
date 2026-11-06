Feature: Dynamic controls

  Scenario: Enabling the text box
    Given The Internet's "/dynamic_controls" page is open
    When I click "Enable"
    And I type "Strider" into the text box
    Then I see "It's enabled!"
