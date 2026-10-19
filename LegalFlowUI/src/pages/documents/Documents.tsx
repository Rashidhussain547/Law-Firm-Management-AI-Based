import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  ListItemIcon,
  MenuItem,
  ListItemText,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import DescriptionIcon from "@mui/icons-material/Description";
import SearchIcon from "@mui/icons-material/Search";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ImageIcon from "@mui/icons-material/Image";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import caseApi, { CaseStatus } from "../../api/caseApi";
import documentApi from "../../api/documentApi";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import MoreVertIcon from '@mui/icons-material/MoreVert';

import {
  DocumentType,
  type CaseDocument,
  type DocumentType as DocumentTypeValue,
} from "../../types/document";

import "./Documents.css";
import type { DocumentAnalysis } from "../../api/aiApi";
import aiApi from "../../api/aiApi";
//import "./../../theme/theme-variables.css";
type CaseItem = {
  id: string;
  title: string;
  caseNumber?: string | null;
  status: CaseStatus;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const allowedExtensions = [
  ".pdf",
  ".doc",
  ".docx",
  ".txt",
  ".xls",
  ".xlsx",
  ".jpg",
  ".jpeg",
  ".png",
];

const getDocumentTypeLabel = (type: DocumentTypeValue) => {
  switch (type) {
    case DocumentType.CourtDocument:
      return "Court Document";

    case DocumentType.Contract:
      return "Contract";

    case DocumentType.Evidence:
      return "Evidence";

    case DocumentType.LegalNotice:
      return "Legal Notice";

    case DocumentType.ClientDocument:
      return "Client Document";

    case DocumentType.Report:
      return "Report";

    case DocumentType.Other:
      return "Other";

    default:
      return "Other";
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const units = ["Bytes", "KB", "MB", "GB"];

  const index = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${
    units[index]
  }`;
};

const formatDate = (date: string) => {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getFileIcon = (contentType: string) => {
  if (contentType === "application/pdf") {
    return <PictureAsPdfIcon />;
  }

  if (contentType.startsWith("image/")) {
    return <ImageIcon />;
  }

  if (contentType.includes("word") || contentType.includes("document")) {
    return <DescriptionIcon />;
  }

  return <InsertDriveFileIcon />;
};

const Documents = () => {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");

  const [documents, setDocuments] = useState<CaseDocument[]>([]);

  const [loadingCases, setLoadingCases] = useState(true);

  const [loadingDocuments, setLoadingDocuments] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [selectedDocument, setSelectedDocument] = useState<CaseDocument | null>(
    null,
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [documentType, setDocumentType] = useState<DocumentTypeValue>(
    DocumentType.Other,
  );

  const [description, setDescription] = useState("");

  const [uploading, setUploading] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<CaseDocument | null>(
    null,
  );
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [previewText, setPreviewText] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
const [analyzingId, setAnalyzingId] =
  useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState(null);
const open = Boolean(anchorEl);

const handleMenuClick = (event:any) => {
  setAnchorEl(event.currentTarget);
};

const handleMenuClose = () => {
  setAnchorEl(null);
};

const [analysis, setAnalysis] =
  useState<DocumentAnalysis | null>(null);

const [analysisDialogOpen, setAnalysisDialogOpen] =
  useState(false);
  const loadCases = async () => {
    setLoadingCases(true);
    setError("");

    try {
      const data = await caseApi.getAll();

      setCases(data);

      if (data.length > 0) {
        setSelectedCaseId(data[0].id);
      }
    } catch (error: any) {
      setError(error?.response?.data?.message || "Unable to load cases.");
    } finally {
      setLoadingCases(false);
    }
  };

  const loadDocuments = async (caseId: string) => {
    if (!caseId) {
      setDocuments([]);
      return;
    }

    setLoadingDocuments(true);
    setError("");

    try {
      const data = await documentApi.getAll(caseId);

      setDocuments(data);
    } catch (error: any) {
      setError(error?.response?.data?.message || "Unable to load documents.");

      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      loadDocuments(selectedCaseId);
    }
  }, [selectedCaseId]);

  const selectedCase = useMemo(
    () => cases.find((item) => item.id === selectedCaseId),
    [cases, selectedCaseId],
  );

  const filteredDocuments = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return documents;
    }

    return documents.filter((document) => {
      const type = getDocumentTypeLabel(document.type).toLowerCase();

      return (
        document.originalFileName?.toLowerCase().includes(searchValue) ||
        document.description?.toLowerCase().includes(searchValue) ||
        type.includes(searchValue)
      );
    });
  }, [documents, search]);

  const handleOpenUpload = () => {
    setSelectedFile(null);

    setDocumentType(DocumentType.Other);

    setDescription("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setUploadDialogOpen(true);
  };

  const handleCloseUpload = () => {
    if (uploading) {
      return;
    }

    setUploadDialogOpen(false);
    setSelectedFile(null);
    setDescription("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const extension = "." + file.name.split(".").pop()?.toLowerCase();

    if (!extension || !allowedExtensions.includes(extension)) {
      setError(
        "Unsupported file type. Allowed types: PDF, DOC, DOCX, TXT, XLS, XLSX, JPG, JPEG, PNG.",
      );

      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be 10 MB or less.");

      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    setError("");
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedCaseId) {
      setError("Please select a case.");
      return;
    }

    if (!selectedFile) {
      setError("Please select a file.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      await documentApi.upload(
        selectedCaseId,
        selectedFile,
        documentType,
        description,
      );

      await loadDocuments(selectedCaseId);

      handleCloseUpload();
    } catch (error: any) {
      setError(error?.response?.data?.message || "Unable to upload document.");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (document: CaseDocument) => {
    if (!selectedCaseId) {
      return;
    }

    setDownloadingId(document.id);
    setError("");

    try {
      const response = await documentApi.download(selectedCaseId, document.id);

      const blob = new Blob([response.data]);

      const url = window.URL.createObjectURL(blob);

      const anchor = window.document.createElement("a");

      anchor.href = url;

      anchor.download = document.originalFileName || document.fileName;

      window.document.body.appendChild(anchor);

      anchor.click();

      anchor.remove();

      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      setError("Unable to download document.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleAnalyzeDocument = async (
  documentId: string,
) => {
  if (!selectedCaseId) {
    return;
  }

  try {
    setAnalyzingId(documentId);
    setError("");

    const result =
      await aiApi.generateDocumentAnalysis(
        selectedCaseId,
        documentId,
      );

    setAnalysis(result);
    setAnalysisDialogOpen(true);
  } catch (error: any) {
    setError(
      error?.response?.data?.message ||
        "Unable to analyze document with AI.",
    );
  } finally {
    setAnalyzingId(null);
  }
};

  const handleOpenDelete = (document: CaseDocument) => {
    setSelectedDocument(document);
    setDeleteDialogOpen(true);
  };

  const handleCloseDelete = () => {
    if (deleting) {
      return;
    }

    setDeleteDialogOpen(false);
    setSelectedDocument(null);
  };

  const handleDelete = async () => {
    if (!selectedCaseId || !selectedDocument) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await documentApi.delete(selectedCaseId, selectedDocument.id);

      await loadDocuments(selectedCaseId);

      setDeleteDialogOpen(false);
      setSelectedDocument(null);
    } catch (error: any) {
      setError(error?.response?.data?.message || "Unable to delete document.");
    } finally {
      setDeleting(false);
    }
  };

  const isPreviewableInline = (contentType: string) => {
    return (
      contentType === "application/pdf" ||
      contentType.startsWith("image/") ||
      contentType === "text/plain"
    );
  };

  const handleView = async (document: CaseDocument) => {
    if (!selectedCaseId) {
      return;
    }

    setPreviewDocument(document);
    setPreviewDialogOpen(true);
    setPreviewLoading(true);
    setPreviewError("");
    setPreviewUrl("");
    setPreviewText("");

    try {
      const response = await documentApi.download(selectedCaseId, document.id);

      const blob = new Blob([response.data], { type: document.contentType });

      if (document.contentType === "text/plain") {
        const text = await blob.text();
        setPreviewText(text);
      } else {
        const url = window.URL.createObjectURL(blob);
        setPreviewUrl(url);
      }
    } catch (error: any) {
      setPreviewError("Unable to load preview.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleClosePreview = () => {
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
    }

    setPreviewDialogOpen(false);
    setPreviewDocument(null);
    setPreviewUrl("");
    setPreviewText("");
    setPreviewError("");
  };

  return (
    <Box className="documents-page">
      <Box className="documents-header">
        <Box>
          <Typography variant="h4" className="documents-title">
            Documents
          </Typography>

          <Typography variant="body2" className="documents-subtitle">
            Manage case files, evidence and legal documents.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenUpload}
          disabled={!selectedCaseId}
        >
          Upload Document
        </Button>
      </Box>

      {error && (
        <Alert
          severity="error"
          className="documents-alert"
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      <Card className="documents-toolbar-card">
        <CardContent className="documents-toolbar">
          <TextField
            select
            label="Select case"
            value={selectedCaseId}
            onChange={(event) => setSelectedCaseId(event.target.value)}
            className="document-case-select"
            disabled={loadingCases || cases.length === 0}
          >
            {cases
              .filter((caseItem) => caseItem.status !== CaseStatus.Closed)
              .map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.caseNumber
                    ? `${item.caseNumber} - ${item.title}`
                    : item.title}
                </MenuItem>
              ))}
          </TextField>

          <Box className="document-search-wrapper">
            <SearchIcon className="document-search-icon" />

            <TextField
              fullWidth
              placeholder="Search documents..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="document-search"
            />
          </Box>
        </CardContent>
      </Card>

      <Box className="selected-case-info">
        <Box className="selected-case-icon">
          <DescriptionIcon />
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary">
            Documents for
          </Typography>

          <Typography variant="h6" className="selected-case-title">
            {selectedCase?.caseNumber
              ? `${selectedCase.caseNumber} - ${selectedCase.title}`
              : selectedCase?.title || "No case selected"}
          </Typography>
        </Box>
      </Box>

      <Card className="documents-table-card">
        {loadingCases || loadingDocuments ? (
          <Box className="documents-loading">
            <CircularProgress />

            <Typography variant="body2" color="text.secondary">
              Loading documents...
            </Typography>
          </Box>
        ) : cases.length === 0 ? (
          <Box className="documents-empty">
            <DescriptionIcon className="empty-icon" />

            <Typography variant="h6" className="empty-title">
              No cases available
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Create a case first before uploading documents.
            </Typography>
          </Box>
        ) : filteredDocuments.length === 0 ? (
          <Box className="documents-empty">
            <DescriptionIcon className="empty-icon" />

            <Typography variant="h6" className="empty-title">
              No documents found
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {search
                ? "Try changing your search."
                : "This case does not have any documents yet."}
            </Typography>

            {!search && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleOpenUpload}
                className="empty-action"
              >
                Upload First Document
              </Button>
            )}
          </Box>
        ) : (
          <Box className="documents-table">
            <Box className="document-row document-row-header">
              <Typography>Document</Typography>
              <Typography>Type</Typography>
              <Typography>Size</Typography>
              <Typography>Uploaded</Typography>
              <Typography>Description</Typography>
              <Typography>Actions</Typography>
            </Box>

            {filteredDocuments.map((document) => (
              <Box className="document-row" key={document.id}>
                <Box className="document-name-cell">
                  <Box className="document-file-icon">
                    {getFileIcon(document.contentType)}
                  </Box>

                  <Box className="document-name-content">
                    <Typography className="document-file-name">
                      {document.originalFileName}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {document.contentType}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <span className="document-type-badge">
                    {getDocumentTypeLabel(document.type)}
                  </span>
                </Box>

                <Typography className="document-cell-text">
                  {formatFileSize(document.fileSize)}
                </Typography>

                <Typography className="document-cell-text">
                  {formatDate(document.createdAt)}
                </Typography>

                <Typography className="document-cell-text document-description">
                  {document.description || "-"}
                </Typography>

                <Box className="document-actions">
  <IconButton
    size="small"
    onClick={handleMenuClick}
    aria-controls={open ? 'document-menu' : undefined}
    aria-haspopup="true"
    aria-expanded={open ? 'true' : undefined}
  >
    <MoreVertIcon fontSize="small" />
  </IconButton>

  <Menu
    id="document-menu"
    anchorEl={anchorEl}
    open={open}
    onClose={handleMenuClose}
    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
  >
    {/* View Action */}
    <MenuItem
      onClick={() => {
        handleView(document);
        handleMenuClose();
      }}
    >
      <ListItemIcon>
        <VisibilityIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText>View</ListItemText>
    </MenuItem>

    {/* Download Action */}
    <MenuItem
      disabled={downloadingId === document.id}
      onClick={() => {
        handleDownload(document);
        handleMenuClose();
      }}
    >
      <ListItemIcon>
        {downloadingId === document.id ? (
          <CircularProgress size={18} />
        ) : (
          <DownloadIcon fontSize="small" />
        )}
      </ListItemIcon>
      <ListItemText>Download</ListItemText>
    </MenuItem>

    {/* AI Analyze Action */}
    <MenuItem
      disabled={analyzingId === document.id}
      onClick={() => {
        handleAnalyzeDocument(document.id);
        handleMenuClose();
      }}
    >
      <ListItemIcon>
        {analyzingId === document.id ? (
          <CircularProgress size={18} />
        ) : (
          <AutoAwesomeIcon fontSize="small" />
        )}
      </ListItemIcon>
      <ListItemText>Analyze with AI</ListItemText>
    </MenuItem>

    {/* Delete Action */}
    <MenuItem
      onClick={() => {
        handleOpenDelete(document);
        handleMenuClose();
      }}
    >
      <ListItemIcon>
        <DeleteIcon fontSize="small" color="error" />
      </ListItemIcon>
      <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
    </MenuItem>
  </Menu>
</Box>
              </Box>
            ))}
          </Box>
        )}
      </Card>

      <Dialog
        open={uploadDialogOpen}
        onClose={handleCloseUpload}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Upload Document</DialogTitle>

        <DialogContent>
          <Box className="document-form">
            <Box className="file-upload-box">
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />

              <DescriptionIcon className="upload-file-icon" />

              <Typography variant="body1" className="upload-file-title">
                {selectedFile ? selectedFile.name : "Select a document"}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                PDF, DOC, DOCX, TXT, XLS, XLSX, JPG, JPEG or PNG
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Maximum file size: 10 MB
              </Typography>

              <Button
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                className="choose-file-button"
              >
                {selectedFile ? "Choose Another File" : "Choose File"}
              </Button>
            </Box>

            <TextField
              select
              label="Document type"
              value={documentType}
              onChange={(event) =>
                setDocumentType(Number(event.target.value) as DocumentTypeValue)
              }
              fullWidth
            >
              <MenuItem value={DocumentType.CourtDocument}>
                Court Document
              </MenuItem>

              <MenuItem value={DocumentType.Contract}>Contract</MenuItem>

              <MenuItem value={DocumentType.Evidence}>Evidence</MenuItem>

              <MenuItem value={DocumentType.LegalNotice}>Legal Notice</MenuItem>

              <MenuItem value={DocumentType.ClientDocument}>
                Client Document
              </MenuItem>

              <MenuItem value={DocumentType.Report}>Report</MenuItem>

              <MenuItem value={DocumentType.Other}>Other</MenuItem>
            </TextField>

            <TextField
              label="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              fullWidth
              multiline
              minRows={3}
              placeholder="Add a short description..."
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseUpload} disabled={uploading}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={uploading || !selectedFile}
          >
            {uploading ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Upload Document"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDelete}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Delete Document</DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete{" "}
            <strong>{selectedDocument?.originalFileName}</strong>? This action
            cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDelete} disabled={deleting}>
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={previewDialogOpen}
        onClose={handleClosePreview}
        fullWidth
        maxWidth="md"
        className="preview-dialog"
      >
        <DialogTitle className="preview-dialog-title">
          <Box className="preview-dialog-title-text">
            {previewDocument && getFileIcon(previewDocument.contentType)}
            <Typography noWrap className="preview-file-name">
              {previewDocument?.originalFileName}
            </Typography>
          </Box>

          <IconButton size="small" onClick={handleClosePreview}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent className="preview-dialog-content">
          {previewLoading ? (
            <Box className="preview-loading">
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                Loading preview...
              </Typography>
            </Box>
          ) : previewError ? (
            <Box className="preview-fallback">
              <InsertDriveFileIcon className="preview-fallback-icon" />
              <Typography variant="body2" color="text.secondary">
                {previewError}
              </Typography>
            </Box>
          ) : previewDocument &&
            !isPreviewableInline(previewDocument.contentType) ? (
            <Box className="preview-fallback">
              <InsertDriveFileIcon className="preview-fallback-icon" />
              <Typography variant="body1" className="preview-fallback-title">
                Preview not available for this file type
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {previewDocument.originalFileName} — download the file to view
                it.
              </Typography>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownload(previewDocument)}
                className="preview-fallback-download"
              >
                Download
              </Button>
            </Box>
          ) : previewDocument?.contentType === "application/pdf" ? (
            <iframe
              src={previewUrl}
              title={previewDocument.originalFileName}
              className="preview-pdf-frame"
            />
          ) : previewDocument?.contentType.startsWith("image/") ? (
            <Box className="preview-image-wrapper">
              <img
                src={previewUrl}
                alt={previewDocument.originalFileName}
                className="preview-image"
              />
            </Box>
          ) : previewDocument?.contentType === "text/plain" ? (
            <pre className="preview-text">{previewText}</pre>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
  open={analysisDialogOpen}
  onClose={() =>
    setAnalysisDialogOpen(false)
  }
  fullWidth
  maxWidth="md"
>
  <DialogTitle>
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <AutoAwesomeIcon />

      AI Document Analysis
    </Box>
  </DialogTitle>

  <DialogContent>
    {analysis && (
      <Box>
        <Typography
          variant="h6"
          gutterBottom
        >
          {analysis.fileName}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          {analysis.documentType}
        </Typography>

        <Typography
          variant="subtitle1"
          //fontWeight={700}
        >
          Summary
        </Typography>

        <Typography
          variant="body2"
          sx={{
            mt: 1,
            mb: 3,
            lineHeight: 1.7,
          }}
        >
          {analysis.summary}
        </Typography>

        <Typography
          variant="subtitle1"
          //fontWeight={700}
        >
          Key Points
        </Typography>

        <Box sx={{ mb: 3 }}>
          {analysis.keyPoints.map(
            (item, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{ mt: 1 }}
              >
                • {item}
              </Typography>
            ),
          )}
        </Box>

        <Typography
          variant="subtitle1"
          //fontWeight={700}
        >
          Important Dates
        </Typography>

        <Box sx={{ mb: 3 }}>
          {analysis.importantDates.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
            >
              No important dates identified.
            </Typography>
          ) : (
            analysis.importantDates.map(
              (item, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{ mt: 1 }}
                >
                  • {item}
                </Typography>
              ),
            )
          )}
        </Box>

        <Typography
          variant="subtitle1"
          //fontWeight={700}
        >
          Parties
        </Typography>

        <Box sx={{ mb: 3 }}>
          {analysis.parties.map(
            (item, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{ mt: 1 }}
              >
                • {item}
              </Typography>
            ),
          )}
        </Box>

        <Typography
          variant="subtitle1"
          //fontWeight={700}
        >
          Potential Issues
        </Typography>

        <Box sx={{ mb: 3 }}>
          {analysis.potentialIssues.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
            >
              No potential issues identified.
            </Typography>
          ) : (
            analysis.potentialIssues.map(
              (item, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{ mt: 1 }}
                >
                  • {item}
                </Typography>
              ),
            )
          )}
        </Box>

        <Typography
          variant="subtitle1"
          //fontWeight={700}
        >
          Important Clauses
        </Typography>

        <Box sx={{ mb: 3 }}>
          {analysis.importantClauses.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
            >
              No important clauses identified.
            </Typography>
          ) : (
            analysis.importantClauses.map(
              (item, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{ mt: 1 }}
                >
                  • {item}
                </Typography>
              ),
            )
          )}
        </Box>

        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            backgroundColor:
              "var(--primary-light, rgba(103,58,183,0.08))",
          }}
        >
          <Typography
            variant="subtitle1"
            //fontWeight={700}
          >
            Recommended Action
          </Typography>

          <Typography
            variant="body2"
            sx={{ mt: 1 }}
          >
            {analysis.recommendedAction}
          </Typography>
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            mt: 3,
            lineHeight: 1.6,
          }}
        >
          {analysis.disclaimer}
        </Typography>
      </Box>
    )}
  </DialogContent>

  <DialogActions>
    <Button
      onClick={() =>
        setAnalysisDialogOpen(false)
      }
    >
      Close
    </Button>
  </DialogActions>
</Dialog>
    </Box>
  );
};

export default Documents;
