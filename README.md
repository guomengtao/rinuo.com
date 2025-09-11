# rinuo.com

## Project Overview
rinuo.com is a platform dedicated to collecting and organizing high-quality free technical resources, aiming to provide developers with convenient tool and learning resource navigation services. The platform covers multiple technical fields including development tools, API services, cloud resources, and design materials. All content is carefully curated with a focus on practicality and compliance, providing valuable reference information for developers and technology enthusiasts.

## Core Content
- **Development Tools Collection**: Resources for the entire development process including IDEs, CI/CD tools, debugging tools, etc.
- **Free API Services**: Organized public API interfaces and usage guides
- **Learning Resources Navigation**: Recommended learning channels such as technical documentation, tutorials, and communities
- **Design Resources Library**: Design materials like icons, fonts, and usage specifications

## Resource Features
- All resources are labeled with usage licenses and restrictions
- Regularly updated to reflect mainstream technology trends
- Provides detailed usage scenario suggestions and best practices

## Data Extraction and Synchronization

### Automated Data Extraction Script

This project provides an intelligent data extraction script `extract_data.py` that automatically extracts service information from HTML files and synchronizes it to JSON data files.

#### Features

- **Intelligent Data Extraction**: Automatically identifies service information in HTML tables, list items, and card views
- **Multi-format Support**: Supports three HTML structures - table view, list item view, and card view
- **Automatic Classification**: Automatically categorizes service data based on file names
- **Data Synchronization**: Maintains real-time synchronization between HTML and JSON data
- **Summary Index**: Generates a summary JSON file containing all services for quick search
- **Bilingual Support**: Category names support both Chinese and English for different language environments

#### Extracted Data Fields

Each service includes the following information:
- `title`: Service name
- `url`: Official website link
- `description`: Service description
- `features`: Features/limitations
- `tags`: Functional tags
- `isFree`: Whether it's free
- `isOpenSource`: Whether it's open source
- `updatedAt`: Update time
- `region`: Service region

#### Install Dependencies

```bash
# Create Python virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install beautifulsoup4
```

#### Usage

1. **First Run**: Extract data from all HTML files and create JSON files
   ```bash
   source venv/bin/activate
   python extract_data.py
   ```

2. **Subsequent Runs**: When HTML files are updated, rerun the script to synchronize data
   ```bash
   source venv/bin/activate
   python extract_data.py
   ```

3. **View Results**: The script will generate in the `assets/data/` directory:
   - Category-specific JSON files (e.g., `cdn.json`, `ai.json`, etc.)
   - Summary file `summary.json` (contains all service data)

#### Output File Structure

```
assets/data/
├── cdn.json          # CDN service data
├── ai.json           # AI service data
├── email.json        # Email service data
├── ...               # Other category data
└── summary.json      # Summary data (contains search index)
```

#### Summary File Features

The `summary.json` file provides:
- **Statistics**: Total service count, total category count
- **Category Overview**: Service count and update time for each category, with bilingual names
- **Search Indexes**:
  - By category: `searchIndex.byCategory` (English)
  - By Chinese category name: `searchIndex.byCategoryName` (Chinese)
  - By tag: `searchIndex.byTag`
  - By free status: `searchIndex.byFreeStatus`
  - By open source status: `searchIndex.byOpenSource`

#### Use Cases

- **Website Search**: Quickly implement site-wide search using the summary file
- **Data Statistics**: Get service count statistics by category
- **API Interface**: Provide unified data interface for frontend applications
- **Data Analysis**: Analyze free resource distribution and trends

For detailed usage examples, please refer to the [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) document.

#### Notes

- The script will completely replace service data in JSON files - do not add custom fields to JSON
- Ensure HTML file structure complies with script recognition rules
- Recommended to run the script promptly after modifying HTML to maintain data synchronization

## Contribution Guide
Welcome to submit issues via GitHub to supplement quality resources or report problems. Please refer to the project Issues template for contribution process.

## License
This project adopts the MIT License. See the LICENSE file for details.
