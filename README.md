# Creality OS Video Record Daemon

[![Lint](https://github.com/vjarskee/creality-os-video-record-daemon/actions/workflows/lint.yaml/badge.svg)](https://github.com/vjarskee/creality-os-video-record-daemon/actions/workflows/lint.yaml)

## Important

On this project Dockerfile specifies the following dependencies from the Alpine Linux repository:

- FFmpeg (licensed under GPL/LGPL) https://ffmpeg.org/
- Noto Font (SIL Open Font License)

## Description

This is a simple project I wrote for my home use. It installs on your home server/PC/NAS/etc. as a Docker container and records video from a connected to printer camera with debug information. Well, to understand at what layer and under what circumstances something went wrong.

## Install and run

0. Install docker, lol
1. Clone the repository
2. Build image

```bash
docker build . --tag creality-os-video-record-daemon
```

3. Run container

```bash
docker run \
  --detach \
  --volume *your_videos_directory_path*:/usr/app/output:rw \
  --env HOST=*your_printer_ip_or_hostname*
  creality-os-video-record-daemon
```

## Customization

You can customize the video sign by replacing the `templates/txt_output.mustache` file with your own. Mustache is used for templating. The following variables are possible:

| Variable name      | Description                                                                           |
| ------------------ | ------------------------------------------------------------------------------------- |
| layer              | Current print layer                                                                   |
| total_layer        | Total number of layers                                                                |
| current_position_x | Current hotend position along the X axis                                              |
| current_position_y | Current hotend position along the Y axis                                              |
| current_position_z | Current hotend position along the Z axis                                              |
| nozzle_temp        | Current nozzle temperature                                                            |
| target_nozzle_temp | Target nozzle temperature                                                             |
| bed_temp           | Current hotbed temperature                                                            |
| target_bed_temp    | Target hotbed temperature                                                             |
| print_file_name    | Current print file name (like mymodel.gcode)                                          |
| print_job_time     | The amount of time how long has printing been going on (hh:mm:ss)                     |
| print_left_time    | The amount of time left until the end of printing (hh:mm:ss)                          |
| print_start_date   | Date and time of the start of printing (in js `Date.toLocaleString()` format)         |
| print_end_date     | Estimated date and time of the end of printing (in js `Date.toLocaleString()` format) |
| print_progress     | Print progress as a percentage                                                        |

## License

Licensed under the [MIT](LICENSE) license.
