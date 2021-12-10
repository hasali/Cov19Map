require "application_system_test_case"

class ProvincesTest < ApplicationSystemTestCase
  setup do
    @province = provinces(:one)
  end

  test "visiting the index" do
    visit provinces_url
    assert_selector "h1", text: "Provinces"
  end

  test "creating a Province" do
    visit provinces_url
    click_on "New Province"

    fill_in "Coverage", with: @province.coverage
    fill_in "Date", with: @province.date
    fill_in "Numtotal 1dose", with: @province.numtotal_1dose
    fill_in "Numtotal 2dose", with: @province.numtotal_2dose
    fill_in "Prov name", with: @province.prov_name
    click_on "Create Province"

    assert_text "Province was successfully created"
    click_on "Back"
  end

  test "updating a Province" do
    visit provinces_url
    click_on "Edit", match: :first

    fill_in "Coverage", with: @province.coverage
    fill_in "Date", with: @province.date
    fill_in "Numtotal 1dose", with: @province.numtotal_1dose
    fill_in "Numtotal 2dose", with: @province.numtotal_2dose
    fill_in "Prov name", with: @province.prov_name
    click_on "Update Province"

    assert_text "Province was successfully updated"
    click_on "Back"
  end

  test "destroying a Province" do
    visit provinces_url
    page.accept_confirm do
      click_on "Destroy", match: :first
    end

    assert_text "Province was successfully destroyed"
  end
end
