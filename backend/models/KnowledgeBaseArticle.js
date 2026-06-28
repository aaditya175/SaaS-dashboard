import mongoose from 'mongoose';

const knowledgeBaseArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: String,
  },
  author: {
    type: String,
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true,
});

const KnowledgeBaseArticle = mongoose.model('KnowledgeBaseArticle', knowledgeBaseArticleSchema);

export default KnowledgeBaseArticle;
