// Helper functions extracted from main app

function classNames(classes) {
  const toBeClasses = Object.keys(classes).map((key) =>
    classes[key] === true ? key : '',
  );
  return toBeClasses.join(' ');
}

const format = {
  time: (seconds) => {
    if (!seconds) return '0:00';
    if (typeof seconds === 'string') seconds = parseInt(seconds);

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

    return `${minutes}:${formattedSeconds}`;
  }
}

export {
  classNames,
  format
}