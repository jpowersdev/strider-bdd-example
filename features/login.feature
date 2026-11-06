Feature: Login

  Background:
    Given The Internet's "/login" page is open

  Scenario: Logging in
    When I log in as "tomsmith" with "SuperSecretPassword!"
    Then I see "You logged into a secure area!"

  Scenario: A wrong password
    When I log in as "tomsmith" with "letmein"
    Then I see "Your password is invalid!"
