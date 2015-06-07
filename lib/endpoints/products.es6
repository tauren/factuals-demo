import express from 'express';
import middleware from '../../middleware';
import documentStore from '../documentStore';

var router = express.Router();

// CQRS/EventSourcing product viewmodel endpoints
router.all('*',
  middleware.setContentType()
);
router.get('/:productId',
  function(req, res) {
    documentStore.getReport('ProductDetailsReports', req.params.productId, function(err, product) {
      console.log('get product', req.params.productId);
      if (err) {
        return res.json({error: err});
      }
      res.json({data:product});
    });
  }
);

export default router;
