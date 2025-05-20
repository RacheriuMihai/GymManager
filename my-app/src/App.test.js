import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App"; // Adjust the path based on your file structure

describe("Add Button Functionality", () => {
  it("should open the add form when the Add button is clicked", () => {
    // Render the App component
    render(<App />);

    // Get the Add button
    const addButton = screen.getByText(/add/i);

    // Simulate a click event on the Add button
    fireEvent.click(addButton);

    // Check if the form for adding a gym is displayed
    const formTitle = screen.getByText(/add gym/i);
    expect(formTitle).toBeInTheDocument();

    // Verify that input fields are visible
    expect(screen.getByPlaceholderText(/gym name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/location/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/open hours/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/price/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/rating/i)).toBeInTheDocument();
  });
});

describe("Delete Button Functionality", () => {
  it("should open the delete confirmation dialog when the Delete button is clicked", () => {
    // Render the App component
    render(<App />);

    // Select a gym card to enable the Delete button
    const gymCard = screen.getByText(/revo/i); // Assuming "Revo" is one of the gyms
    fireEvent.click(gymCard);

    // Get the Delete button
    const deleteButton = screen.getByText(/delete/i);

    // Simulate a click event on the Delete button
    fireEvent.click(deleteButton);

    // Check if the delete confirmation dialog is displayed
    const confirmationTitle = screen.getByText(/are you sure/i);
    expect(confirmationTitle).toBeInTheDocument();
  });
});

describe("Update Button Functionality", () => {
  it("should open the update form when the Update button is clicked", () => {
    // Render the App component
    render(<App />);

    // Select a gym card to enable the Update button
    const gymCard = screen.getByText(/revo/i); // Assuming "Revo" is one of the gyms
    fireEvent.click(gymCard);

    // Get the Update button
    const updateButton = screen.getByText(/update/i);

    // Simulate a click event on the Update button
    fireEvent.click(updateButton);

    // Check if the form for updating a gym is displayed
    const formTitle = screen.getByText(/update gym/i);
    expect(formTitle).toBeInTheDocument();

    // Verify that input fields are visible with pre-filled values (e.g., "Revo")
    expect(screen.getByPlaceholderText(/gym name/i)).toHaveValue("Revo");
  });
});

describe("Read Operation Functionality", () => {
  it("should display gym records correctly in the UI", () => {
    // Render the App component
    render(<App />);

    // Check if gym records are displayed
    const gymRecord1 = screen.getByText(/revo/i); // Assuming "Revo" is one of the gyms
    const gymRecord2 = screen.getByText(/18 gym/i); // Assuming "18 Gym" is another gym
    const gymRecord3 = screen.getByText(/reshape/i); // Assuming "Reshape" is another gym

    // Assert that all records are visible
    expect(gymRecord1).toBeInTheDocument();
    expect(gymRecord2).toBeInTheDocument();
    expect(gymRecord3).toBeInTheDocument();
  });
});