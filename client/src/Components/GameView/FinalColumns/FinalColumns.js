import React from "react";
import styles from "./FinalColumns.module.css";
import { isDroppable } from "../../../utils/card";
import FinalColumnItem from "../FinalColumnItem/FinalColumnItem";
import DraggableCard from "../DraggableCard/DraggableCard";
import Drop from "../Drop/drop";

const FinalColumns = ({
  finalColumns,
  columns,
  draggingCard,
  setHistory,
  history,
  setDraggingCard,
  setMoveNumbers,
  setPoints,
  handleDrop,
}) => {
  const handleReverseDrop = (currentCards, draggingCards) => {
    const selectedCard = currentCards.array[currentCards.array.length - 1];
    const dropTarget = draggingCards.array[0];
    const dragArrayLength = draggingCards.array.length;
    const carriedArray = columns[draggingCard.title].get;
    const carriedArrayLength = carriedArray.length;
    const sliceEnd = carriedArrayLength - dragArrayLength;
    const carriedTarget = draggingCard.target;

    setMoveNumbers((prev) => prev + 1);
    if (
      (currentCards.array.length === 0 &&
        draggingCards.array[0].rank === "A") ||
      (currentCards.array.length > 0 && isDroppable(dropTarget, selectedCard))
    ) {
      let newHistoryStep;
      if (draggingCards.title === "startColumn2") {
        const source = columns["startColumn1"].get;

        const index = draggingCard.cardIndex;
        source.splice(index - 1, 1);
        columns[draggingCard.title].set([]);
        columns["startColumn1"].set(source);
        columns[currentCards.title].set([
          ...currentCards.array,
          ...draggingCards.array,
        ]);
        newHistoryStep = {
          source: draggingCard.title,
          target: currentCards.title,
          draggedCards: draggingCard.array,
          cardIndex: index,
        };
      } else {
        columns[currentCards.title].set([
          ...currentCards.array,
          ...draggingCards.array,
        ]);
        const reducedColumn = carriedArray.slice(0, sliceEnd);
        if (reducedColumn.length > 0)
          reducedColumn[reducedColumn.length - 1].isVisible = true;
        columns[draggingCard.title].set(reducedColumn);
        let reversed = null;
        if (
          reducedColumn.length > 0 &&
          !reducedColumn[reducedColumn.length - 1].isVisible
        ) {
          reversed = reducedColumn.length - 1;
        }
        newHistoryStep = {
          source: draggingCard.title,
          target: currentCards.title,
          draggedCards: draggingCard.array,
          reversed,
        };
      }
      setHistory([...history, newHistoryStep]);
      setPoints((prev) => prev + 10);
    } else {
      carriedTarget.style.opacity = 1;
      let sibling = carriedTarget.nextElementSibling;
      while (sibling !== null) {
        sibling.style.opacity = 1;
        sibling = sibling.nextElementSibling;
      }
    }
    setDraggingCard({ title: "", array: [] });
  };
  return (
    <div className={styles.finalColumnContainer}>
      {Object.entries(finalColumns).map(([key, column]) => {
        const card = column.get[column.get.length - 1];
        return (
          <div className={styles.finalColumn} key={key}>
            <div className={styles.cardShadow}>
              {card ? (
                <DraggableCard
                  type="card"
                  key={0}
                  top={0}
                  index={1}
                  item={card}
                  name={key}
                  setDraggingCard={setDraggingCard}
                  isLastItem={true}
                  onDrop={handleDrop}
                  currentArr={column.get}
                  draggingArr={draggingCard}
                />
              ) : null}
              <Drop
                onDrop={handleReverseDrop}
                currentArr={column.get}
                draggingArr={draggingCard}
                accept="card"
                name={key}
                isDragActive={
                  draggingCard.array.length > 0 && draggingCard.title !== key
                }
                top={0}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FinalColumns;